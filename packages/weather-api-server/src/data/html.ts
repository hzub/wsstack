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
    <script>
    function getJson(url) {
      fetch(url).then(r => r.json()).then(response => {console.log("ODPOWIEDŹ:"); console.log(response); });
    }
    function getText(url) {
      fetch(url).then(r => r.text()).then(response => {console.log("ODPOWIEDŹ:"); console.log(response); });
    }
    </script>
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
    <li><a href="/studia/api/json">https://www.wowapi.pl/studia/api/json</a> - Przykładowa odpowiedź JSON <button onClick="getJson('https://www.wowapi.pl/studia/api/json')">FETCH</button></li>
    <li><a href="/studia/api/text">https://www.wowapi.pl/studia/api/text</a> - Przykładowa odpowiedź tekstowa <button onClick="getText('https://www.wowapi.pl/studia/api/text')">FETCH</button></li>
    <li><a href="/studia/api/img">https://www.wowapi.pl/studia/api/img</a> - Przykładowa odpowiedź obrazkowa</li>
    </ul>
${generalHtmlFooter()}
`;

export const generalWeatherRouteHtml = () => `
${generalHtmlHeader()}
    <h3>Witaj w API pogodowym kursu tworzenia stron WWW!</h3>
    Zawartość:
    <ul>
    <li><a href="/pogoda/miasta" />https://www.wowapi.pl/pogoda/miasta</a> - API z listą map  <button onClick="getJson('https://www.wowapi.pl/pogoda/miasta')">FETCH</button></li>
    <li><a href="/pogoda/prognoza?miasto=warszawa" />https://www.wowapi.pl/pogoda/prognoza?miasto=[NAZWA MIASTA]</a> - API z prognozą dla danego miasta (np. https://www.wowapi.pl/pogoda/prognoza?miasto=warszawa)  <button onClick="getJson('https://www.wowapi.pl/pogoda/prognoza?miasto=warszawa')">FETCH</button></li>
    </ul>
${generalHtmlFooter()}
`;
