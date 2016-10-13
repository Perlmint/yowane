module.exports = {
  entry: [
    "./src/client.ts"
  ],
  output: {
      path: require("path").resolve("./out/asset"),
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
  }
}