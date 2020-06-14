#!/usr/bin/env node
const args = require('yargs').argv._;
const webpack = require('webpack');
const path = require('path');
const DevServer = require('webpack-dev-server');
const babelLoader = require('babel-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const workingDir = path.resolve(process.cwd());
const outputDir = path.resolve(workingDir, './out');

console.log(workingDir);

const webpackConfig = (mode) => ({
  devtool: mode === "production" ? "none" : "source-map",
  entry: workingDir + "/src/script.js",
  output: {
    path: outputDir,
    filename: "script.js"
  },
  mode,
  plugins: [new HtmlWebpackPlugin({
    template: 'src/index.html',

  })],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            require.resolve('@babel/preset-env'),
          ],
          plugins: [require.resolve('@babel/plugin-proposal-object-rest-spread')]
        }
      }
    }]
  }
})


if (args[0] === "start") {
  console.log("Uruchamiam aplikację...");
  const server = new DevServer(webpack(webpackConfig("development")), {
    contentBase: path.resolve(workingDir, './out'),
  });
  server.listen(3000, () => {

  });
}

if (args[0] === "build") {
  console.log("Buduję aplikację...");
  require('fs-extra').removeSync(outputDir);
  webpack(webpackConfig("development")).run((e, s) => {
    console.log("Zbudowano!");
  })
}
