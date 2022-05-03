import S3 from "aws-sdk/clients/s3";
import Cloudfront from "aws-sdk/clients/cloudfront";

import mime from "mime-types";
import yauzl from "yauzl-promise";

import iconv from "iconv-lite";

const s3 = new S3();
const cloudfront = new Cloudfront();

const BUCKET_NAME = process.env.BUCKET_NAME || "ws-students-alpha";
const DISTRIBUTION_ID = process.env.DISTRIBUTION_ID || "E2VUTRMUPJ75TN";

const config = {
  BUCKET_NAME,
  DISTRIBUTION_ID,
};

const yauzlOptions: yauzl.Options = {
  decodeStrings: false,
};

const getFilenameList = async (inputFile: string | Buffer) => {
  const zipFile =
    typeof inputFile === "string"
      ? await yauzl.open(inputFile, yauzlOptions)
      : await yauzl.fromBuffer(inputFile, yauzlOptions);

  const fileNames: string[] = [];
  await zipFile.walkEntries(async (entry) => {
    const entryFileName = iconv.decode(
      entry.fileName as unknown as Buffer,
      "UTF8"
    );
    if (entryFileName[entryFileName.length - 1] === "/") {
      return;
    }
    fileNames.push(entryFileName);
  });
  await zipFile.close();
  return fileNames;
};

const normalizeCommonPrefix: (strings: string[]) => { [k: string]: string } = (
  strings: string[]
) => {
  const firstFileFolders = strings[0].split("/");
  if (firstFileFolders.length === 1) {
    return strings;
  }

  let commonPart = "";

  for (let i = firstFileFolders.length - 1; i >= 0; i--) {
    let testSegment = firstFileFolders.slice(0, i).join("/");

    if (strings.every((s) => s.indexOf(testSegment) === 0)) {
      commonPart = testSegment;
      break;
    }
  }

  return strings.reduce((acc, sourceFilename) => {
    let newFilename = sourceFilename.substr(commonPart.length);
    newFilename = newFilename[0] === "/" ? newFilename.substr(1) : newFilename;
    return {
      ...acc,
      [sourceFilename]: newFilename,
    };
  }, {});
};

export const extractUploadZip = async (
  inputFile: string | Buffer,
  folderName: string
) => {
  const filesList = await getFilenameList(inputFile);
  const normalizedFilePaths = normalizeCommonPrefix(filesList);

  const zipFile =
    typeof inputFile === "string"
      ? await yauzl.open(inputFile, yauzlOptions)
      : await yauzl.fromBuffer(inputFile, yauzlOptions);

  const promises: Promise<any>[] = [];

  await zipFile.walkEntries(async (entry) => {
    const entryFileName = iconv.decode(
      entry.fileName as unknown as Buffer,
      "UTF8"
    );

    if (entryFileName[entryFileName.length - 1] === "/") {
      return;
    }

    const fileStream = await entry.openReadStream();

    // @ts-ignore
    fileStream.length = entry.uncompressedSize;
    promises.push(
      new Promise<void>((fileResolve, fileReject) => {
        const normalizedFileName =
          normalizedFilePaths[entryFileName] || entryFileName;
        s3.putObject(
          {
            Bucket: config.BUCKET_NAME,
            Key: "students/" + folderName + "/" + normalizedFileName,
            Body: fileStream,
            ContentType: mime.lookup(entryFileName) || "text/plain",
          },
          function (err) {
            if (err) {
              console.log("Error during upload: ", err);
              fileReject(err);
            }
            console.log("Sent file:", entryFileName, "as", normalizedFileName);
            fileResolve();
          }
        );
      })
    );
  });

  await Promise.all(promises);

  return new Promise<void>((resolve, reject) => {
    cloudfront.createInvalidation(
      {
        DistributionId: config.DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: `WsStudentsApp${Date.now()}`,
          Paths: {
            Quantity: 1,
            Items: ["/" + folderName + "/*"],
          },
        },
      },
      (err) => {
        if (!err) {
          console.log("All files sent, CDN cache invalidated");
          resolve();
        } else {
          reject();
        }
      }
    );
  });
};
