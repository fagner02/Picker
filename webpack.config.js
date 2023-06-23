const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
module.exports = {
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      {
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
  plugins: [new Dotenv()],
  entry: {
    script: path.resolve(__dirname, "src/script.ts"),
    load: path.resolve(__dirname, "src/load.ts"),
  },
  output: {
    filename: "[name].js",
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
