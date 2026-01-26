/* eslint-disable */
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    // Only build the app entry point, inject mock before it
    app: ['./src/mock/index.js', './src/app/index.js']
  },
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: {
      index: 'index.html'
    },
    devMiddleware: {
      writeToDisk: false,
    }
  },
  resolve: {
    alias: {
      // Redirect webextension-polyfill to our mock
      'webextension-polyfill': path.resolve(__dirname, 'src/mock/index.js')
    }
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /webextension-polyfill/,
      path.resolve(__dirname, 'src/mock/index.js')
    ),
  ]
})
