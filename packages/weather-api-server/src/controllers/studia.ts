import { Express } from "express";
import { studiaRouteHtml } from "../data/html";
import { CAT } from "../data/image";
import {
  sendFormattedJSONResponse,
  sendHTMLResponse,
  sendTextResponse,
} from "../lib/response";
import { IEndpointQueryPrognoza } from "../lib/types";

export const studiaController = (app: Express) => {
  app.get<any, any, any, IEndpointQueryPrognoza>("/studia", (_, res) => {
    sendHTMLResponse(res, studiaRouteHtml());
  });
  app.get<any, any, any, IEndpointQueryPrognoza>(
    "/studia/api/json",
    (_, res) => {
      sendFormattedJSONResponse(res, {
        pole1: "wartosc1",
        pole2: "wartosc2",
        tablica: [123, 234, 345],
        obiekt: {
          zagniezdzenie: {
            tablicaZnowu: ["abc", "bca", "xyz"],
          },
        },
      });
    }
  );
  app.get<any, any, any, IEndpointQueryPrognoza>(
    "/studia/api/img",
    (_, res) => {
      res.setHeader("content-type", "image/jpeg");
      const bf = Buffer.from(CAT, "base64");
      res.send(bf);
    }
  );
  app.get<any, any, any, IEndpointQueryPrognoza>("/studia/api/text", (_, res) =>
    sendTextResponse(res, "To jest zwykly niesformatowany tekst")
  );
};
