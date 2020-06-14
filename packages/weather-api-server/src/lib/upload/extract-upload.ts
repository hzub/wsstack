import S3 from "aws-sdk/clients/s3";
import Cloudfront from "aws-sdk/clients/cloudfront";

import mime from "mime-types";
import yauzl from "yauzl-promise";

const s3 = new S3();
const cloudfront = new Cloudfront();

const BUCKET_NAME = process.env.BUCKET_NAME || "ws-students-alpha";
const DISTRIBUTION_ID = process.env.DISTRIBUTION_ID || "E2VUTRMUPJ75TN";

const config = {
  BUCKET_NAME,
  DISTRIBUTION_ID,
};

const getFilenameList = async (inputFile: string | Buffer) => {
  const zipFile =
    typeof inputFile === "string"
      ? await yauzl.open(inputFile)
      : await yauzl.fromBuffer(inputFile);

  const fileNames: string[] = [];
  await zipFile.walkEntries(async (entry) => {
    if (entry.fileName[entry.fileName.length - 1] === "/") {
      return;
    }
    fileNames.push(entry.fileName);
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

  return strings
    .map((s) => s.substr(commonPart.length))
    .map((s) => (s[0] === "/" ? s.substr(1) : s));
};

export const extractUploadZip = async (
  inputFile: string | Buffer,
  folderName: string
) => {
  const filesList = await getFilenameList(inputFile);
  const normalizedFilePaths = normalizeCommonPrefix(filesList);

  const zipFile =
    typeof inputFile === "string"
      ? await yauzl.open(inputFile)
      : await yauzl.fromBuffer(inputFile);

  const promises: Promise<any>[] = [];

  await zipFile.walkEntries(async (entry) => {
    if (entry.fileName[entry.fileName.length - 1] === "/") {
      return;
    }

    const fileStream = await entry.openReadStream();

    // @ts-ignore
    fileStream.length = entry.uncompressedSize;
    promises.push(
      new Promise((fileResolve, fileReject) => {
        const normalizedFileName =
          normalizedFilePaths[entry.fileName] || entry.fileName;
        s3.putObject(
          {
            Bucket: config.BUCKET_NAME,
            Key: "students/" + folderName + "/" + normalizedFileName,
            Body: fileStream,
            ContentType: mime.lookup(entry.fileName) || "text/plain",
          },
          function (err) {
            if (err) {
              console.log("Error during upload: ", err);
              fileReject(err);
            }
            console.log("Sent file:", entry.fileName, "as", normalizedFileName);
            fileResolve();
          }
        );
      })
    );
  });

  await Promise.all(promises);

  return new Promise((resolve, reject) => {
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
