import { format, subYears } from "date-fns";
import { Express } from "express";
import * as faker from "faker/locale/pl";
import regionyJson from "../data/city.json";
import ludzie from "../data/ludzie.json";
import nazwiskaZenskie from "../data/nazwiska_zenskie.json";
import uliceJson from "../data/ulice.json";
import zainteresowania from "../data/zainteresowania.json";
import { sendFormattedJSONResponse } from "../lib/response";
import { IEndpointQueryLudzie } from "../lib/types";

const randomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const peopleController = (app: Express) => {
  app.get<any, any, any, IEndpointQueryLudzie>("/ludzie", (req, res) => {
    if (req.query.imie) {
      const queryName = req.query.imie;
      sendFormattedJSONResponse(
        res,
        ludzie.filter(
          (l) => l.imie.toLowerCase().indexOf(queryName.toLowerCase()) === 0
        )
      );
    }
    if (req.query.nazwisko) {
      const querySurname = req.query.nazwisko;
      sendFormattedJSONResponse(
        res,
        ludzie.filter(
          (l) =>
            l.nazwisko.toLowerCase().indexOf(querySurname.toLowerCase()) === 0
        )
      );
    }
    if (req.query.zainteresowania) {
      const queryHobby = req.query.zainteresowania;
      sendFormattedJSONResponse(
        res,
        ludzie.filter((l) =>
          l.zainteresowania.some(
            (z) => z.toLowerCase().indexOf(queryHobby.toLowerCase()) === 0
          )
        )
      );
    }
    sendFormattedJSONResponse(res, ludzie);
  });
};

export const generatePeople = (limit: number = 200) => {
  const miasta = regionyJson.reduce<string[]>(
    (acc, curr) => [...acc, ...curr.cities.map((c) => c.text_simple)],
    []
  );

  const ulice = uliceJson.features.map((f) => f.properties.a6);

  const people: any[] = [];
  for (let i = 0; i < limit; i++) {
    const name = faker.name.firstName();
    const gender = name[name.length - 1] === "a" ? "F" : "M";
    const person = {
      imie: name,
      nazwisko:
        gender === "M" ? faker.name.lastName() : randomElement(nazwiskaZenskie),
      miasto: randomElement(miasta),
      ulica: randomElement(ulice) + " " + Math.round(Math.random() * 100 + 5),
      dataUrodzenia: format(subYears(faker.date.past(5), 15), "yyyy-MM-dd"),
      zainteresowania: new Array(Math.round(Math.random() * 3) + 1)
        .fill(0)
        .map(() => randomElement(zainteresowania)),
    };

    people.push(person);
  }

  return people;
};
