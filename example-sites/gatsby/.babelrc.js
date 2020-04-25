const path = require("path")

module.exports = {
  presets: [
    [
      "babel-preset-gatsby",
      {
        targets: {
          browsers: [">0.25%", "not dead", "not IE 11"],
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
        cacheDir: path.resolve(__dirname, "./.rss-cache"),
      },
    ],
  ],
}
