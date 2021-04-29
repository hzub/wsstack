#!/usr/bin/env node
const args = require("yargs").argv._;
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const caseJs = require("case");
const { spawn } = require("child_process");
const ora = require("ora");

const {
  indexHtml,
  packageJson,
  scriptJs,
  styleCss,
} = require("./fileTemplates");

const stripPolishLetters = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0142/g, "l")
    .replace(/\u0141/g, "L");
};

const logError = (err) => {
  console.log(
    chalk.whiteBright("[WowDroid - Błąd]") + " " + chalk.redBright(err)
  );
};

const logMessage = (msg) => {
  console.log(chalk.whiteBright("[WowDroid]") + " " + chalk.greenBright(msg));
};

const logInfo = (msg) => {
  console.log(chalk.whiteBright("[WowDroid]") + " " + chalk.blueBright(msg));
};

const run = () => {
  if (args.length < 1) {
    logError(
      `Musisz podać nazwę aplikacji / katalogu, np. "${chalk.yellowBright(
        "npx wowdroid moja-aplikacja"
      )}"`
    );
    return;
  }

  const desiredName = stripPolishLetters(caseJs.kebab(args.join(" ").trim()));
  const desiredDirectory = path.resolve(process.cwd(), desiredName);

  if (fs.existsSync(desiredDirectory)) {
    const filesInFolder = fs.readdirSync(desiredDirectory).length;
    if (filesInFolder) {
      logError(
        `Katalog "${chalk.yellowBright(
          desiredName
        )}" już istnieje, musisz utworzyć inny!`
      );

      return;
    }
  } else {
    fs.mkdirSync(desiredDirectory);
  }

  fs.mkdirSync(desiredDirectory + "/src");
  fs.writeFileSync(
    `${desiredDirectory}/package.json`,
    packageJson(desiredName)
  );

  fs.writeFileSync(
    `${desiredDirectory}/src/index.html`,
    indexHtml(desiredName)
  );
  fs.writeFileSync(`${desiredDirectory}/src/style.css`, styleCss(desiredName));
  fs.writeFileSync(`${desiredDirectory}/src/script.js`, scriptJs(desiredName));

  process.chdir(desiredDirectory);

  const npmExec = spawn("npm", ["install"], {
    detached: false,
    shell: true,
  });

  const spinner = ora({
    stream: process.stdout,
    prefixText: chalk.greenBright(
      `${chalk.whiteBright("[WowDroid]")} Tworzę aplikację "${chalk.whiteBright(
        desiredName
      )}"...`
    ),
  });

  spinner.start();

  const stdErr = [];
  npmExec.stderr.on("data", (data) => {
    stdErr.push(data.toString());
  });

  npmExec.on("close", (code) => {
    if (code === 0) {
      spinner.clear();
      spinner.stop();
      logInfo(`Aplikacja "${chalk.whiteBright(desiredName)}" stworzona!`);
      logMessage(
        `- Teraz możesz przejść do katalogu aplikacji ("${chalk.yellowBright(
          `cd ${desiredName}`
        )}")`
      );
      logMessage(
        `- Następnie włączyć tryb developerski z pomocą polecenia "${chalk.yellowBright(
          `npm run start`
        )}"`
      );
    } else {
      spinner.clear();
      spinner.stop();
      logError("Coś poszło nie tak. Błąd:");
      console.log(chalk.white(stdErr.join("")));
      logError(
        "Sprawdź swoje połączenie z internetem - jeśli to nie pomoże, skontaktuj się z nami!"
      );
    }
  });
};

console.log();
logMessage(
  chalk.greenBright(
    `${chalk.whiteBright("Wow School")} przedstawia: ${chalk.yellowBright(
      `WowDroid (${require("./package.json").version})`
    )}`
  )
);
run();
