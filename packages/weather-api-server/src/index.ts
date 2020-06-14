import express from "express";
import { peopleController } from "./controllers/people";
import { uploadController } from "./controllers/upload";
import { weatherController } from "./controllers/weather";
import { generalController } from "./controllers/general";

const ensureEnv = (k: string) => {
  if (!process.env[k]) {
    throw new Error(`No ${k} env set!`);
  }
};

const app = express();
// docker run -p 4000:4000 --env-file .env -t wea:latest
const setup = () => {
  ensureEnv("API_KEY");
  ensureEnv("UPLOAD_API_KEY");

  weatherController(app);
  uploadController(app);
  peopleController(app);
  generalController(app);

  app.listen(process.env.PORT || 80);
};

setup();