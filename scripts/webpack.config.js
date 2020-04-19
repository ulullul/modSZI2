import fs from 'fs';
import endsWith from 'lodash/endsWith';
import filter from 'lodash/filter';
import get from 'lodash/get';
import head from 'lodash/head';
import includes from 'lodash/includes';
import invoke from 'lodash/invoke';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import replace from 'lodash/replace';
import set from 'lodash/set';
import toLower from 'lodash/toLower';
import path from 'path';
import webpack from 'webpack';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import nodeExternals from 'webpack-node-externals';
import overrideRules from './lib/override-rules';
import package_ from '../package.json';

const UnusedWebpackPlugin = require('unused-webpack-plugin');

const ROOT_DIR = path.resolve(__dirname, '..');
const resolvePath = (...parameters) => path.resolve(ROOT_DIR, ...parameters);
const SRC_DIR = resolvePath('src');
const BUILD_DIR = resolvePath('build');

const isDebug = !includes(process.argv, '--release');
const isVerbose = includes(process.argv, '--verbose');
const isAnalyze =
  includes(process.argv, '--analyze') || includes(process.argv, '--analyse');

const reScript = /\.(js|jsx|mjs)$/;
const reStyle = /\.(css|less|styl|scss|sass|sss)$/;
const reImage = /\.(bmp|gif|jpg|jpeg|png|svg)$/;
const staticAssetName = isDebug
  ? '[path][name].[ext]?[hash:8]'
  : '[hash:8].[ext]';
const BABEL_PRESET_ENV = '@babel/preset-env';
const FILE_LOADER = 'file-loader';

//
// Common configuration chunk to be used for both
// client-side (client.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const config = {
  bail: !isDebug,

  cache: isDebug,

  context: ROOT_DIR,

  devtool: isDebug ? 'cheap-module-inline-source-map' : 'source-map',

  mode: isDebug ? 'development' : 'production',

  // Don't attempt to continue if there are any errors.
  module: {
    // Make missing exports an error instead of warning
    rules: [
      // Rules for JS / JSX
      {
        include: [SRC_DIR, resolvePath('scripts')],
        loader: 'babel-loader',
        options: {
          // https://github.com/babel/babel-loader#options
          babelrc: false,

          // https://babeljs.io/docs/usage/options/
          cacheDirectory: isDebug,
          configFile: false,
          plugins: [
            // Experimental ECMAScript proposals
            '@babel/plugin-transform-runtime',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-syntax-dynamic-import',
            // Treat React JSX elements as value types and hoist them to the highest scope
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements
            ...(isDebug ? [] : ['@babel/transform-react-constant-elements']),
            // Replaces the React.createElement function with one that is more optimized for production
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements
            ...(isDebug ? [] : ['@babel/transform-react-inline-elements']),
            // Remove unnecessary React propTypes from the production build
            // https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types
            ...(isDebug ? [] : ['transform-react-remove-prop-types']),
          ],
          presets: [
            // A Babel preset that can automatically determine the Babel plugins and polyfills
            // https://github.com/babel/babel-preset-env
            [
              BABEL_PRESET_ENV,
              {
                debug: false,
                forceAllTransforms: !isDebug, // for UglifyJS
                modules: false,
                targets: {
                  browsers: package_.browserslist,
                },
                useBuiltIns: false,
              },
            ],
            // JSX
            // https://github.com/babel/babel/tree/master/packages/babel-preset-react
            ['@babel/preset-react', { development: isDebug }],
          ],
        },
        test: reScript,
      },

      // Rules for Style Sheets
      {
        rules: [
          // Convert CSS into JS module
          {
            issuer: { not: [reStyle] },
            use: 'isomorphic-style-loader',
          },

          // Process external/third-party styles
          {
            exclude: SRC_DIR,
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: isDebug,
            },
          },

          // Process internal/project styles (from src folder)
          {
            include: SRC_DIR,
            loader: 'css-loader',
            options: {
              // CSS Loader https://github.com/webpack/css-loader
              importLoaders: 1,
              modules: {
                localIdentName: isDebug
                  ? '[name]-[local]-[hash:base64:5]'
                  : '[hash:base64:5]',
              },
              // CSS Modules https://github.com/css-modules/css-modules
              sourceMap: isDebug,
            },
          },

          // Apply PostCSS plugins including autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: './scripts/postcss.config.js',
              },
            },
          },

          // Compile Less to CSS
          // https://github.com/webpack-contrib/less-loader
          // Install dependencies before uncommenting: yarn add --dev less-loader less
          // {
          //   test: /\.less$/,
          //   loader: 'less-loader',
          // },

          // Compile Sass to CSS
          // https://github.com/webpack-contrib/sass-loader
          // Install dependencies before uncommenting: yarn add --dev sass-loader node-sass
          // {
          //   test: /\.(scss|sass)$/,
          //   loader: 'sass-loader',
          // },
        ],
        test: reStyle,
      },

      // Rules for images
      {
        oneOf: [
          // Inline lightweight images into CSS
          {
            issuer: reStyle,
            oneOf: [
              // Inline lightweight SVGs as UTF-8 encoded DataUrl string
              {
                loader: 'svg-url-loader',
                options: {
                  limit: 4096,
                  name: staticAssetName, // 4kb
                },
                test: /\.svg$/,
              },

              // Inline lightweight images as Base64 encoded DataUrl string
              {
                loader: 'url-loader',
                options: {
                  limit: 4096,
                  name: staticAssetName, // 4kb
                },
              },
            ],
          },

          // Or return public URL to image resource
          {
            loader: FILE_LOADER,
            options: {
              name: staticAssetName,
            },
          },
        ],
        test: reImage,
      },

      // Convert plain text into JS module
      {
        loader: 'raw-loader',
        test: /\.txt$/,
      },

      // Return public URL for all assets unless explicitly excluded
      // DO NOT FORGET to update `exclude` list when you adding a new loader
      {
        exclude: [reScript, reStyle, reImage, /\.json$/, /\.txt$/, /\.md$/],
        loader: FILE_LOADER,
        options: {
          name: staticAssetName,
        },
      },

      // Exclude dev modules from production build
      ...(isDebug
        ? []
        : [
            {
              loader: 'null-loader',
              test: resolvePath(
                'node_modules/react-deep-force-update/lib/index.js',
              ),
            },
          ]),
    ],

    strictExportPresence: true,
  },

  output: {
    chunkFilename: isDebug
      ? '[name].chunk.js'
      : '[name].[chunkhash:8].chunk.js',
    devtoolModuleFilenameTemplate: info =>
      replace(path.resolve(info.absoluteResourcePath), /\\/g, '/'),
    filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
    path: resolvePath(BUILD_DIR, 'public/assets'),
    pathinfo: isVerbose,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    publicPath: '/assets/',
  },

  // Specify what bundle information gets displayed
  // https://webpack.js.org/configuration/stats/
  resolve: {
    // Allow absolute paths in imports, e.g. import Button from 'components/Button'
    // Keep in sync with .flowconfig and .eslintrc
    modules: ['node_modules', 'src'],
  },

  // Choose a developer tool to enhance debugging
  // https://webpack.js.org/configuration/devtool/#devtool
  stats: {
    cached: isVerbose,
    cachedAssets: isVerbose,
    chunkModules: isVerbose,
    chunks: isVerbose,
    colors: true,
    hash: isVerbose,
    modules: isVerbose,
    reasons: isDebug,
    timings: true,
    version: isVerbose,
  },
};

//
// Configuration for the client-side bundle (client.js)
// -----------------------------------------------------------------------------

const clientConfig = {
  ...config,

  entry: {
    client: ['core-js/stable', './src/client.js'],
  },
  name: 'client',

  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          name: 'vendors',
          test: /[/\\]node_modules[/\\]/,
        },
      },
    },
  },

  // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
  plugins: [
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      __DEV__: isDebug,
      'process.env.BROWSER': true,
    }),

    // Emit a file with assets paths
    // https://github.com/webdeveric/webpack-assets-manifest#options
    new WebpackAssetsManifest({
      customize: ({ key, value }) => {
        // You can prevent adding items to the manifest by returning false.
        if (endsWith(toLower(key), '.map')) return false;
        return { key, value };
      },
      done: (manifest, stats) => {
        // Write chunk-manifest.json.json
        const chunkFileName = `${BUILD_DIR}/chunk-manifest.json`;
        try {
          const fileFilter = file => !endsWith(file, '.map');
          const addPath = file => manifest.getPublicPath(file);
          const chunkFiles = reduce(
            get(stats, 'compilation.chunkGroups'),
            (accumulator, c) => {
              set(accumulator, c.name, [
                ...get(accumulator, c.name, []),
                ...reduce(
                  c.chunks,
                  (files, cc) => [
                    ...files,
                    ...map(filter(cc.files, fileFilter), addPath),
                  ],
                  [],
                ),
              ]);
              return accumulator;
            },
            Object.create(null),
          );
          fs.writeFileSync(chunkFileName, JSON.stringify(chunkFiles, null, 2));
        } catch (error) {
          console.error(`ERROR: Cannot write ${chunkFileName}:`, error);
          if (!isDebug) throw new Error('Failed to build');
        }
      },
      output: `${BUILD_DIR}/asset-manifest.json`,
      publicPath: true,
      writeToDisk: true,
    }),

    ...(isDebug
      ? [
          new UnusedWebpackPlugin({
            // Source directories
            directories: [SRC_DIR],
            // Exclude patterns
            exclude: [
              '*.test.js',
              'client.js',
              'config.js',
              'server.js',
              '*.server.js',
              'package.json',
              'components/Html.js',
            ],
            // Root directory (optional)
            root: ROOT_DIR,
          }),
        ]
      : Array.from(isAnalyze ? [new BundleAnalyzerPlugin()] : [])),
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.js.org/configuration/node/
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  target: 'web',
};

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

const serverConfig = {
  ...config,

  entry: {
    server: ['core-js/stable', './src/server.js'],
  },
  externals: [
    './chunk-manifest.json',
    './asset-manifest.json',
    nodeExternals({
      whitelist: [reStyle, reImage],
    }),
  ],

  module: {
    ...config.module,

    rules: overrideRules(get(config, 'module.rules'), rule => {
      // Override babel-preset-env configuration for Node.js
      if (rule.loader === 'babel-loader') {
        return {
          ...rule,
          options: {
            ...rule.options,
            presets: map(get(rule, 'options.presets'), preset =>
              head(preset) !== BABEL_PRESET_ENV
                ? preset
                : [
                    BABEL_PRESET_ENV,
                    {
                      debug: false,
                      modules: false,
                      targets: {
                        node: head(
                          invoke(package_, 'engines.node.match', /(\d+\.?)+/),
                        ),
                      },
                      useBuiltIns: false,
                    },
                  ],
            ),
          },
        };
      }

      // Override paths to static assets
      if (
        rule.loader === FILE_LOADER ||
        rule.loader === 'url-loader' ||
        rule.loader === 'svg-url-loader'
      ) {
        return {
          ...rule,
          options: {
            ...rule.options,
            emitFile: false,
          },
        };
      }

      return rule;
    }),
  },

  name: 'server',

  // Webpack mutates resolve object, so clone it to avoid issues
  // https://github.com/webpack/webpack/issues/4817
  node: {
    Buffer: false,
    __dirname: false,
    __filename: false,
    console: false,
    global: false,
    process: false,
  },

  output: {
    ...config.output,
    chunkFilename: 'chunks/[name].js',
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: BUILD_DIR,
  },

  plugins: [
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      __DEV__: isDebug,
      'process.env.BROWSER': false,
    }),

    // Adds a banner to the top of each generated chunk
    // https://webpack.js.org/plugins/banner-plugin/
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      entryOnly: false,
      raw: true,
    }),
    new UnusedWebpackPlugin({
      // Source directories
      directories: [SRC_DIR],
      // Exclude patterns
      exclude: [
        '*.test.js',
        'client.js',
        '*.client.js',
        'server.js',
        'package.json',
        'dom-utils.js',
        'routes/water-consumption/WaterConsumptionMetrics',
      ],
      // Root directory (optional)
      root: ROOT_DIR,
    }),
  ],

  resolve: {
    ...config.resolve,
  },

  // Do not replace node globals with polyfills
  // https://webpack.js.org/configuration/node/
  target: 'node',
};

export default [clientConfig, serverConfig];
