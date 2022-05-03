import express from "express";
import cors from "cors";
import { peopleController } from "./controllers/people";
import { uploadController } from "./controllers/upload";
import { weatherController } from "./controllers/weather";
import { generalController } from "./controllers/general";
import { studiaController } from "./controllers/studia";

const ensureEnv = (k: string) => {
  if (!process.env[k]) {
    throw new Error(`No ${k} env set!`);
  }
};

const app = express();
app.use(cors());

const setup = () => {
  ensureEnv("API_KEY");
  ensureEnv("UPLOAD_API_KEY");

  weatherController(app);
  uploadController(app);
  peopleController(app);
  generalController(app);
  studiaController(app);

  app.listen(process.env.PORT || 80);
};

setup();
