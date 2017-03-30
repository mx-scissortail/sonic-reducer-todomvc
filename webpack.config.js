const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

module.exports = function (env) {
  var plugins = []; // set below

  if (env && env.production) {
    console.log('\nPRODUCTION BUILD\n');
    plugins = [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        DEBUG: false
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ];
  }

  return {
    entry: {
      Main: './src/app.js',
    },
    output: {
      filename: 'app.js',
      path: './js/'
    },
    resolve: {
      modules: ['node_modules', path.resolve('./src/')]
    },
    plugins,
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          query: {
            cacheDirectory: true,
            presets: [
              ['es2015', {"modules": false}],
              'react'
            ],
            plugins: ["transform-class-properties"]
          }
        }
      ]
    },
    devtool: "source-map"
  };
};
