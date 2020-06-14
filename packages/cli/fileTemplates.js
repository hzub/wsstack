const thisPackageJson = require("./package.json");

const indexHtml = (name) => `
<!doctype html>
<html lang="pl">
  <head>
    <title>${name} - wygenerowane przez WowDroid!</title>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h2>Cześć, tutaj aplikacja ${name}!</h2>
    <ul>
      <li>Edytuj index.html, style.css oraz script.js by zmienić zawartość strony!</li>
      <li>Uruchom polecenie <code>npm run start</code> by zacząć pracować z auto-odświeżaniem!</li>
      <li>Uruchom polecenie <code>npm run build</code> by zbudować stronę do wysłania na serwer!</li>
    </ul>
    <script src="script.js"></script>
  </body>
</html>
`;

const scriptJs = (name) => `
  console.log("Cześć, tutaj aplikacja ${name}!");
`;

const styleCss = () => `
  body {
    font-family: 'Arial';
    background-color: #f5f5f5;
    color: #333333;
  }

  code {
    padding: 2px 6px;
    background-color: #e9e9e9;
  }
`;

const packageJson = (name) => `{
  "name": "${name}",
  "version": "0.1.0",
  "main": "./src/index.js",
  "license": "UNLICENSED",
  "dependencies": {
    "wowschool-www-scripts": "${thisPackageJson.version}"
  },
  "scripts": {
    "start": "wowschool-www-scripts start",
    "build": "wowschool-www-scripts build"
  }
}`;

module.exports = {
  indexHtml,
  scriptJs,
  styleCss,
  packageJson,
};
