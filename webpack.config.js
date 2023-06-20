const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
  plugins: [new Dotenv()],
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
