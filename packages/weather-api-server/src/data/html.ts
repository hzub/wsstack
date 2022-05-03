export const generalHtmlHeader = () => `
<!doctype html>
<html lang="pl">
  <head>
    <title>Wow School - kurs stron WWW - serwer API</title>
    <meta charset="UTF-8" />
  </head>
  <body>
`;

export const generalHtmlFooter = () => `
  </body>
</html>
`;

export const generalRouteHtml = () => `
${generalHtmlHeader()}
    <h3>Witaj na serwerze API kursu tworzenia stron WWW!</h3>
    Zawartość:
    <ul>
    <li><a href="/studia" />https://www.wowapi.pl/studia</a> - Przeróżne API przykładowe</li>
    <li><a href="/ludzie" />https://www.wowapi.pl/ludzie</a> - API z przykładowymi danymi osób</li>
    <li><a href="/pogoda" />https://www.wowapi.pl/pogoda</a> - API pogodowe</li>
    </ul>
${generalHtmlFooter()}
`;

export const studiaRouteHtml = () => `
${generalHtmlHeader()}
    <h3>Witaj na serwerze API kursu tworzenia stron WWW!</h3>
    Zawartość:
    <ul>
    <li><a href="/studia/api/json">https://www.wowapi/studia/api/json</a> - Przykładowa odpowiedź JSON</li>
    <li><a href="/studia/api/text">https://www.wowapi/studia/api/text</a> - Przykładowa odpowiedź tekstowa</li>
    <li><a href="/studia/api/img">https://www.wowapi/studia/api/img</a> - Przykładowa odpowiedź obrazkowa</li>
    </ul>
${generalHtmlFooter()}
`;

export const generalWeatherRouteHtml = () => `
${generalHtmlHeader()}
    <h3>Witaj w API pogodowym kursu tworzenia stron WWW!</h3>
    Zawartość:
    <ul>
    <li><a href="/pogoda/miasta" />https://www.wowapi.pl/pogoda/miasta</a> - API z listą map</li>
    <li><a href="/pogoda/prognoza?miasto=warszawa" />https://www.wowapi.pl/prognoza?miasto=[NAZWA MIASTA]</a> - API z prognozą dla danego miasta (np. https://www.wowapi.pl/prognoza?miasto=warszawa)</li>
    </ul>
${generalHtmlFooter()}
`;
