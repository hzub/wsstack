import axios from "axios";
import { differenceInMinutes } from "date-fns";
import { Express } from "express";
import fs from "fs";
import jsLevenshtein from "js-levenshtein";
import path from "path";
import {
  getErrorInvalidCity,
  getErrorNoCityFound,
  sendFormattedJSONResponse,
  sendHTMLResponse,
} from "../lib/response";
import { IEndpointQueryPrognoza } from "../lib/types";
import { getCities } from "../lib/weather/cities";
import { stripPolishLetters } from "../lib/weather/string";
import { transformForecast } from "../lib/weather/weather";
import { generalWeatherRouteHtml } from "../data/html";

export const weatherController = (app: Express) => {
  app.get<any, any, any, IEndpointQueryPrognoza>("/pogoda/", (_, res) => {
    sendHTMLResponse(res, generalWeatherRouteHtml());
  });
  app.get<any, any, any, IEndpointQueryPrognoza>("/pogoda/miasta", (_, res) => {
    sendFormattedJSONResponse(res, getCities());
  });

  app.get<any, any, any, IEndpointQueryPrognoza>(
    "/pogoda/prognoza",
    async (req, res) => {
      if (!req.query.miasto) {
        res.send(getErrorInvalidCity());
        return;
      }
      const paramCityName = stripPolishLetters(req.query.miasto.toLowerCase());
      const matchingCities = getCities()
        .map((c) => ({
          ...c,
          distance: jsLevenshtein(
            paramCityName,
            stripPolishLetters(c.nazwa.toLowerCase())
          ),
        }))
        .filter((c) => c.distance < 3);

      if (!matchingCities.length) {
        res.send(getErrorNoCityFound());
        return;
      }

      const matchedCity = matchingCities[0];

      const cachePath = path.resolve(
        __dirname,
        `_cache_${stripPolishLetters(matchedCity.nazwa.toLowerCase())}.json`,
        ""
      );
      let cachedValue = null;
      try {
        cachedValue = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      } catch {
        cachedValue = null;
      }

      if (cachedValue && cachedValue.time) {
        if (
          Math.abs(
            differenceInMinutes(new Date(cachedValue.time), new Date())
          ) < 30
        ) {
          sendFormattedJSONResponse(
            res,
            transformForecast(cachedValue, matchedCity.nazwa)
          );
          return;
        }
      }

      console.log(
        "[OWM] Query: ",
        `https://api.openweathermap.org/data/2.5/onecall?lat=${matchedCity.geo.szerokość}&lon=${matchedCity.geo.długość}`
      );
      const { data: apiData } = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${matchedCity.geo.szerokość}&lon=${matchedCity.geo.długość}&appid=${process.env.API_KEY}&lang=pl`
      );

      const newCache = {
        time: new Date().toISOString(),
        data: apiData,
      };

      fs.writeFileSync(cachePath, JSON.stringify(newCache));
      sendFormattedJSONResponse(
        res,
        transformForecast(newCache, matchedCity.nazwa)
      );
    }
  );
};
