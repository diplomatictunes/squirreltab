/* eslint-disable */
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const sveltePreprocess = require('svelte-preprocess')
const path = require('path')

const isDevelopment = process.env.NODE_ENV === 'development';
const mode = process.env.NODE_ENV || 'development'
const PRODUCTION = mode !== 'development';

const clientConfig = {
  development: {
    __CLIENT_ID__: '530831729511-eq8apt6dhjimbmdli90jp2ple0lfmn3l.apps.googleusercontent.com',
    __DEV_CSP_SCRIPT__: '',
    __DEV_CSP_CONNECT__: '',
    __EXT_NAME__: 'IceTab (dev)',
    __CONTENT_SCRIPTS_MATCHES__: process.env.MOZ ? '*://*/*' : 'http://127.0.0.1:8000/*',
  },
  production: {
    __CLIENT_ID__: '530831729511-dclgvblhv7var13mvpjochb5f295a6vc.apps.googleusercontent.com',
    __DEV_CSP_SCRIPT__: '',
    __DEV_CSP_CONNECT__: '',
    __EXT_NAME__: '__MSG_ext_name__',
    __CONTENT_SCRIPTS_MATCHES__: 'https://boss.cnwangjie.com/*',
  }
}

const resolve = (...paths) => path.join(__dirname, ...paths)
const moz = process.env.MOZ

module.exports = {
  entry: {
    app: './src/app/index.js',
    background: './src/background/index.js',
    gdrive_sandbox: './src/gdrive_sandbox.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true,
  },
  mode: mode,

  plugins: [
    new CleanWebpackPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
      'PRODUCTION': JSON.stringify(PRODUCTION),
      'DEBUG': JSON.stringify(isDevelopment),
      ...clientConfig[mode],
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
          // The broken transform function has been removed to ensure a clean copy.
        },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/_locales', to: '_locales' },
        { from: 'src/gdrive_sandbox.html', to: 'gdrive_sandbox.html' },
      ],
    }),

    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/app/index.html',
      chunks: ['app'],
      inject: true,
      minify: PRODUCTION ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      } : false,
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/app/index.html',
      chunks: ['app'],
      excludeChunks: ['background', 'content', 'gdrive_sandbox'],
      inject: true,
      minify: PRODUCTION ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      } : false,
    }),
  ],
  performance: {
    hints: false,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: (chunk) => {
            return chunk.name === 'app';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.svelte', '.json'],
    conditionNames: ['svelte', 'browser', 'import', 'default'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    fullySpecified: false
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: isDevelopment,
              runes: true,
            },
            emitCss: true,
            hotReload: false
          }
        }
      },
      {
        test: /\.svelte\.js$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: isDevelopment,
              runes: true,
            },
            emitCss: false,
            hotReload: false
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  stats: {
    errorDetails: true,
    reasons: true,
    moduleTrace: true,
  }
}
