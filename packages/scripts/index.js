#!/usr/bin/env node
const args = require("yargs").argv._;
const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const DevServer = require("webpack-dev-server");
const babelLoader = require("babel-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DomParser = require("dom-parser");
const glob = require("glob");
const fse = require("fs-extra");
const archiver = require("archiver");

const workingDir = path.resolve(process.cwd());
const inputDir = path.resolve(workingDir, "./src");
const outputDir = path.resolve(workingDir, "./out");
const outputZipFile = path.resolve(workingDir, "./out.zip");
const inputHtmlPath = path.resolve(workingDir, "./src/index.html");

const parseHtml = (filePath) =>
  new Promise((resolve, reject) => {
    try {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      var parser = new DomParser();
      var dom = parser.parseFromString(fileContents);
      // dom.getElementsByTagName("script")[0].attributes
      resolve(dom);
    } catch (e) {
      reject(e);
    }
  });

const webpackConfig = (sources, mode) => ({
  devtool: mode === "production" ? "none" : "source-map",
  entry: sources.reduce(
    (acc, src) => ({ ...acc, [src]: `${workingDir}/src/${src}` }),
    {}
  ),
  output: {
    path: outputDir,
    filename: "[name]",
  },
  mode,
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: "src/index.html",
    //   inject: false,
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [require.resolve("@babel/preset-env")],
            plugins: [
              require.resolve("@babel/plugin-proposal-object-rest-spread"),
            ],
          },
        },
      },
    ],
  },
});

const getScriptSrcsList = (DOM) => {
  return DOM.getElementsByTagName("script")
    .map((a) => {
      const srcAttr = a.attributes.find((a) => a.name.toLowerCase() === "src");
      if (srcAttr) {
        return srcAttr.value;
      }
    })
    .filter(Boolean);
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
    console.log("Uruchamiam aplikację...");
    const sources = getScriptSrcsList(await parseHtml(inputHtmlPath));

    const missingFiles = sources.filter(
      (s) => !fs.existsSync(`${workingDir}/src/${s}`)
    );
    if (missingFiles.length) {
      missingFiles.forEach((mf) => {
        console.log(`[Błąd] Brak pliku skryptu "${mf}"!`);
      });
      return;
    }

    const server = new DevServer(
      webpack(webpackConfig(sources, "development")),
      {
        contentBase: path.resolve(workingDir, "./src"),
        watchContentBase: true,
        open: true,
        clientLogLevel: "silent",
        quiet: true,
      }
    );
    server.listen(3000, () => {});
  }

  if (args[0] === "build") {
    console.log("Buduję aplikację...");
    const sources = getScriptSrcsList(await parseHtml(inputHtmlPath));
    const missingFiles = sources.filter(
      (s) => !fs.existsSync(`${workingDir}/src/${s}`)
    );
    if (missingFiles.length) {
      missingFiles.forEach((mf) => {
        console.log(`[Błąd] Brak pliku skryptu "${mf}"!`);
      });
      return;
    }

    fse.removeSync(outputDir);
    webpack(webpackConfig(sources, "production")).run((e, stats) => {
      if (!e) {
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
          console.log("Zbudowano!");
        });
      }
    });
  }
};

run();
