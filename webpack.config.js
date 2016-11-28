const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

const defaultConfig = {
  resolve: {
    extensions: ["", ".ts", ".js"]
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, exclude: /^\.#/, loader: 'ts' }
    ]
  }
};

const spacefill = Object.assign({}, defaultConfig, {
  entry: [
    "./src/spacefill_entry.ts"
  ],
  output: {
    path: path.resolve("./out"),
    publicPath: "/static",
    filename: "spacefill_entry.js"
  }
});

const oritatami = Object.assign({}, defaultConfig, {
  entry: [
    "./src/client.ts"
  ],
  output: {
      path: path.resolve("./out"),
      publicPath: "/static",
      filename: "client.js"
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
});

module.exports = [oritatami, spacefill];