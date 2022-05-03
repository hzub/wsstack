import { Response } from "express";

export const getErrorInvalidCity = () =>
  `Musisz podać miasto! Poprawny format to np. https://wowapi.pl/pogoda/prognoza/?miasto=Warszawa`;

export const getErrorNoCityFound = () =>
  `Nie znaleziono miasta. Spróbuj wybrać z listy: https://wowapi.pl/pogoda/miasta/`;

export const sendFormattedJSONResponse = (res: Response, val: any) => {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(val, null, 4));
};

export const sendTextResponse = (res: Response, val: string) => {
  res.header("Content-Type", "text/plain");
  res.send(val);
};

export const sendHTMLResponse = (res: Response, val: string) => {
  res.header("Content-Type", "text/html");
  res.send(val);
};
