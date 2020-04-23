const path = require("path")

module.exports = {
  presets: [
    [
      "babel-preset-gatsby",
      {
        targets: {
          browsers: [">0.25%", "not dead"],
        },
      },
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-optional-chaining",
    [
      "@react-style-system/plugin",
      {
        themePath: path.resolve(__dirname, "./src/styles/theme.js"),
        cacheDir: path.resolve(__dirname, "./.cache/caches/rss"),
        moduleResolver: {
          root: [__dirname],
          alias: {
            gatsby: require.resolve("./noop.js"),
            "^.*css$": require.resolve("./noop.js"),
          },
        },
      },
    ],
  ],
}
