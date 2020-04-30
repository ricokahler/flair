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
    [
      "@react-style-system/plugin",
      {
        themePath: path.resolve(__dirname, "./src/styles/theme.js"),
      },
    ],
    "@babel/plugin-proposal-optional-chaining",
  ],
}
