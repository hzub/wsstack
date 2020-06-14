import { Express } from "express";
import { generalRouteHtml } from "../data/html";
import { sendHTMLResponse } from "../lib/response";

export const generalController = (app: Express) => {
  app.get("/", (_, res) => {
    sendHTMLResponse(res, generalRouteHtml());
  });
};
