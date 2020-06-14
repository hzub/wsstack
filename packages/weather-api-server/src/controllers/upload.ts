import caseJs from "case";
import { Express } from "express";
import expressFileParser from "express-multipart-file-parser";
import { extractUploadZip } from "../lib/upload/extract-upload";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadController = (app: Express) => {
  app.use(expressFileParser);

  app.post("/file/upload", async (req, res) => {
    if (!req.body) {
      res.status(400);
      res.send("No body");
      return;
    }
    if (!req.body.key || req.body.key !== process.env.UPLOAD_API_KEY) {
      res.status(401);
      res.send("Unauthorized");
      return;
    }
    if (!req.files || !req.files[0]) {
      res.status(400);
      res.send("No file attached");
      return;
    }
    if (req.files[0].buffer.length > MAX_FILE_SIZE) {
      res.status(413);
      res.send(`File is larger than ${MAX_FILE_SIZE} bytes, rejected`);
      return;
    }
    if (
      typeof req.body.studentName !== "string" ||
      req.body.studentName.toLowerCase() === "www"
    ) {
      res.status(400);
      res.send("No student name defined");
      return;
    }
    const { buffer } = req.files[0];
    try {
      await extractUploadZip(buffer, caseJs.kebab(req.body.studentName));
      res.send("ok");
    } catch (e) {
      res.status(500);
      console.error(e);
      res.send("there was an error: " + JSON.stringify(e));
    }
  });
};
