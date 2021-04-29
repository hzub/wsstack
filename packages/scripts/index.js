#!/usr/bin/env node

const args = require("yargs").argv._;
const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const DevServer = require("webpack-dev-server");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const babelLoader = require("babel-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DomParser = require("dom-parser");
const glob = require("glob");
const fse = require("fs-extra");
const archiver = require("archiver");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const chalk = require("chalk");
const detectPort = require("detect-port");

const DEV_PORT = 3000;

const workingDir = path.resolve(process.cwd());
const inputDir = path.resolve(workingDir, "./src");
const outputDir = path.resolve(workingDir, "./out");
const outputZipFile = path.resolve(workingDir, "./out.zip");
const inputHtmlPath = path.resolve(workingDir, "./src/index.html");

const logError = (err) => {
  console.log(
    chalk.whiteBright("[WowDroid - Błąd]") + " " + chalk.redBright(err)
  );
};

const logMessage = (msg) => {
  console.log(chalk.whiteBright("[WowDroid]") + " " + chalk.greenBright(msg));
};

const parseHtml = (filePath) =>
  new Promise((resolve, reject) => {
    try {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      var parser = new DomParser();
      var dom = parser.parseFromString(fileContents);
      resolve(dom);
    } catch (e) {
      reject(e);
    }
  });

const webpackConfig = (sources, mode) => {
  return {
    devtool: mode === "production" ? "none" : "source-map",
    entry: sources.reduce(
      (acc, src) => ({ ...acc, [src]: `${workingDir}/src/${src}` }),
      {}
    ),
    output: {
      path: outputDir,
      filename: "[name]",
      publicPath: "/",
    },
    mode,
    plugins: [new ErrorOverlayPlugin(), new MiniCssExtractPlugin()],
    module: {
      rules: [
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve("style-loader"),
            },
            {
              loader: require.resolve("css-loader"),
            },
            {
              loader: require.resolve("sass-loader"),
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: require.resolve("babel-loader"),
            options: {
              highlightCode: mode === "production",
              presets: [require.resolve("@babel/preset-env")],
              plugins: [
                require.resolve("@babel/plugin-proposal-object-rest-spread"),
              ],
            },
          },
        },
      ],
    },
  };
};

const isUrl = (testString) => {
  if (typeof testString !== "string") {
    return false;
  }
  return Boolean(
    /^(?:https?)?:\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(
      testString.trim()
    )
  );
};

const getScriptSrcsList = (DOM) => {
  return DOM.getElementsByTagName("script")
    .map((a) => {
      const srcAttr = a.attributes.find((a) => a.name.toLowerCase() === "src");
      if (srcAttr) {
        return srcAttr.value;
      }
    })
    .filter(Boolean)
    .filter((srcName) => !isUrl(srcName));
};

const zipDirectory = () => {
  const output = fs.createWriteStream(outputZipFile);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  archive.pipe(output);
  archive.directory(outputDir, false);
  archive.finalize();
};

const run = async () => {
  if (args[0] === "start") {
    logMessage("Uruchamiam aplikację...");
    const sources = getScriptSrcsList(await parseHtml(inputHtmlPath));

    const missingFiles = sources.filter(
      (s) => !fs.existsSync(`${workingDir}/src/${s}`)
    );
    if (missingFiles.length) {
      missingFiles.forEach((mf) => {
        logError(`Brak pliku skryptu "${mf}"!`);
      });
      return;
    }

    const targetPort = await detectPort(DEV_PORT);

    const server = new DevServer(
      webpack(webpackConfig(sources, "development")),
      {
        contentBase: path.resolve(workingDir, "./src"),
        watchContentBase: true,
        open: true,
        clientLogLevel: "none",
        quiet: true,
        publicPath: "/",
        onListening: () => {
          logMessage(
            `Aplikacja w trybie deweloperskim uruchomiona! Wejdź na ${chalk.whiteBright(
              `http://localhost:${targetPort}/`
            )} w przeglądarce by zobaczyć stronę.`
          );
        },
      }
    );
    server.listen(targetPort, () => {});
  }

  if (args[0] === "build") {
    logMessage("Buduję aplikację...");
    const sources = getScriptSrcsList(await parseHtml(inputHtmlPath));
    const missingFiles = sources.filter(
      (s) => !fs.existsSync(`${workingDir}/src/${s}`)
    );
    if (missingFiles.length) {
      missingFiles.forEach((mf) => {
        logError(`Brak pliku skryptu "${mf}"!`);
      });
      return;
    }

    fse.removeSync(outputDir);
    webpack(webpackConfig(sources, "production")).run((e, stats) => {
      if (!stats.compilation.errors.length) {
        glob(`${inputDir}/**/*`, (er, files) => {
          files.forEach((f) => {
            if (path.extname(f) === ".js") {
              return;
            }
            const targetName = f.substr(inputDir.length);
            fse.copySync(f, `${outputDir}${targetName}`, {
              preserveTimestamps: true,
            });
          });
          zipDirectory();
          logMessage("Zbudowano!");
        });
      } else {
        logError("Wystąpiły błędy podczas budowy:");
        console.log(stats.compilation.errors.join("\n"));
        logError("Przeanalizuj problem i spróbuj jeszcze raz!");
      }
    });
  }
};

run();
