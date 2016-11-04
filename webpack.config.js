const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

module.exports = {
  entry: [
    "./src/client.ts"
  ],
  output: {
      path: path.resolve("./out"),
      publicPath: "/static",
      filename: "client.js"
  },
  resolve: {
    extensions: ["", ".ts"]
  },
  module: {
    loaders: [
        { test: /\.tsx?$/, exclude: /^\.#/, loader: 'ts' }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "public/index.html",
        to: "index.html"
      },
      {
        from: "public/credit.html",
        to: "credit.html"
      },
      {
        from: "public/about.html",
        to: "about.html"
      },
      {
        from: "public/spacefill.html",
        to: "spacefill.html"
      }
    ])
  ]
};