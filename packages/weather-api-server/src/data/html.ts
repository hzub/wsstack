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
    <h3>Witaj na serwerze API kursu tworzenia stron WWW w Wow School!</h3>
    Zawartość:
    <ul>
    <li><a href="/ludzie" />https://www.wowapi.pl/ludzie</a> - API z przykładowymi danymi osób (moduł #9)</li>
    <li><a href="/pogoda" />https://www.wowapi.pl/pogoda</a> - API pogodowe (moduł #10)</li>
    </ul>
${generalHtmlFooter()}
`;

export const generalWeatherRouteHtml = () => `
${generalHtmlHeader()}
    <h3>Witaj w API pogodowym kursu tworzenia stron WWW w Wow School (moduł #9)!</h3>
    Zawartość:
    <ul>
    <li><a href="/pogoda/miasta" />https://www.wowapi.pl/pogoda/miasta</a> - API z listą map</li>
    <li><a href="/pogoda/prognoza?miasto=warszawa" />https://www.wowapi.pl/prognoza?miasto=[NAZWA MIASTA]</a> - API z prognozą dla danego miasta (np. https://www.wowapi.pl/prognoza?miasto=warszawa)</li>
    </ul>
${generalHtmlFooter()}
`;
