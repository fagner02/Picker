const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
  entry: "./src/load.ts",
  output: {
    filename: "load.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: true,
        },
      }),
    ],
  },
};
