import { format, utcToZonedTime } from "date-fns-tz";

export const transformTemperature = (source: number) =>
  parseFloat((source - 273.15).toFixed(1));

const ICONS: { [k: string]: string } = {
  "01": "slonce", // cale słońce
  "02": "chmury1", // słońce za chmurami
  "03": "chmury2", // małe chmury
  "04": "chmury3", // duże chmury
  "09": "deszcz1", // mały deszcz
  "10": "deszcz2", // wielki deszcz
  "11": "burza", // burza
  "13": "snieg", // śnieg
  "50": "mgla", // mgła
};

export const transformIcon = (source: string) => {
  return ICONS[source.replace(/[^0-9]/g, "") as string] || "słońce";
};

export const transformWindDirection = (source: number) => {
  const cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  return cardinals[Math.round((source % 360) / 45)];
};

export const transformWindSpeed = (sourceMps: number) => {
  return parseFloat(((sourceMps / 1000) * 3600).toFixed(1));
};

export const prepareCachePayload = (apiData: any) => ({
  updated: new Date().toISOString(),
  ...apiData,
});

export const transformForecast = (source: any, cityName: string) => {
  const updated = source.time;
  const { current, daily } = source.data;

  const getWeatherBlock = (sourceBlock: any) => ({
    temperatura: transformTemperature(
      typeof sourceBlock.temp === "object"
        ? sourceBlock.temp.day
        : sourceBlock.temp
    ),
    wiatrPrędkość: transformWindSpeed(sourceBlock.wind_speed || 0),
    wiatrKierunek: sourceBlock.wind_deg || 0,
    wiatrKierunekSłownie: transformWindDirection(sourceBlock.wind_deg || 0),
    opis: sourceBlock.weather[0].description,
    ikonka: transformIcon(sourceBlock.weather[0].icon),
    zachmurzenie: sourceBlock.clouds,
    wschódSłońca: format(
      utcToZonedTime(sourceBlock.sunrise * 1000, "Europe/Warsaw"),
      "HH:mm"
    ),
    zachódSłońca: format(
      utcToZonedTime(sourceBlock.sunset * 1000, "Europe/Warsaw"),
      "HH:mm"
    ),
  });

  return {
    miasto: cityName,
    aktualizacja: format(
      utcToZonedTime(updated, "Europe/Warsaw"),
      "yyyy-MM-dd HH:mm"
    ),
    teraz: getWeatherBlock(current),
    prognoza: {
      dziś: getWeatherBlock(daily[0]),
      jutro: getWeatherBlock(daily[1]),
      pojutrze: getWeatherBlock(daily[2]),
    },
  };
};
