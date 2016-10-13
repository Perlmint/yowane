module.exports = {
  entry: [
    "./src/client.ts"
  ],
  output: {
      path: require("path").resolve("./out/asset"),
      publicPath: "/static",
      filename: "client.js"
  }
}