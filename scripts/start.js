import browserSync from 'browser-sync';
import express from 'express';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';
import lodashReject from 'lodash/reject';
import replace from 'lodash/replace';
import path from 'path';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import clean from './clean';
import run, { format } from './run';
import webpackConfig from './webpack.config';

const isDebug = !includes(process.argv, '--release');

// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
  // Watching may not work with NFS and machines in VirtualBox
  // Uncomment next line if it is your case (use true or interval in milliseconds)
  // poll: true,
  // Decrease CPU or memory usage in some file systems
  // ignored: /node_modules/,
};

function createCompilationPromise(name, compiler, config) {
  return new Promise((resolve, reject) => {
    let timeStart = new Date();
    compiler.hooks.compile.tap(name, () => {
      timeStart = new Date();
      console.info(`[${format(timeStart)}] Compiling '${name}'...`);
    });

    compiler.hooks.done.tap(name, stats => {
      console.info(stats.toString(config.stats));
      const timeEnd = new Date();
      const time = timeEnd.getTime() - timeStart.getTime();
      if (stats.hasErrors()) {
        console.info(
          `[${format(timeEnd)}] Failed to compile '${name}' after ${time} ms`,
        );
        reject(new Error('Compilation failed!'));
      } else {
        console.info(
          `[${format(
            timeEnd,
          )}] Finished '${name}' compilation after ${time} ms`,
        );
        resolve(stats);
      }
    });
  });
}

let server;

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function start() {
  if (server) return server;
  server = express();
  server.use(errorOverlayMiddleware());
  server.use(express.static(path.resolve(__dirname, '../public')));

  // Configure client-side hot module replacement
  const clientConfig = find(webpackConfig, ['name', 'client']);
  clientConfig.entry.client = ['./scripts/lib/webpack-hot-development-client']
    .concat(clientConfig.entry.client)
    .sort((a, b) => includes(b, 'polyfill') - includes(a, 'polyfill'));
  clientConfig.output.filename = replace(
    clientConfig.output.filename,
    'chunkhash',
    'hash',
  );
  clientConfig.output.chunkFilename = replace(
    clientConfig.output.chunkFilename,
    'chunkhash',
    'hash',
  );
  clientConfig.module.rules = lodashReject(clientConfig.module.rules, [
    'loader',
    'null-loader',
  ]);
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Configure server-side hot module replacement
  const serverConfig = find(webpackConfig, ['name', 'server']);
  serverConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
  serverConfig.output.hotUpdateChunkFilename =
    'updates/[id].[hash].hot-update.js';
  serverConfig.module.rules = lodashReject(serverConfig.module.rules, [
    'loader',
    'null-loader',
  ]);
  serverConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Configure compilation
  await run(clean);
  const multiCompiler = webpack(webpackConfig);
  const clientCompiler = find(multiCompiler.compilers, ['name', 'client']);
  const serverCompiler = find(multiCompiler.compilers, ['name', 'server']);
  const clientPromise = createCompilationPromise(
    'client',
    clientCompiler,
    clientConfig,
  );
  const serverPromise = createCompilationPromise(
    'server',
    serverCompiler,
    serverConfig,
  );

  // https://github.com/webpack/webpack-dev-middleware
  server.use(
    webpackDevMiddleware(clientCompiler, {
      logLevel: 'silent',
      publicPath: clientConfig.output.publicPath,
      watchOptions,
    }),
  );

  // https://github.com/glenjamin/webpack-hot-middleware
  server.use(webpackHotMiddleware(clientCompiler, { log: false }));

  let appPromise;
  let appPromiseResolve;
  let appPromiseIsResolved = true;
  serverCompiler.hooks.compile.tap('server', () => {
    if (!appPromiseIsResolved) return;
    appPromiseIsResolved = false;
    // eslint-disable-next-line no-return-assign
    appPromise = new Promise(resolve => (appPromiseResolve = resolve));
  });

  let app;
  server.use(async (request, response) => {
    try {
      await appPromise;
      app.handle(request, response);
    } catch (error) {
      console.error(error);
    }
  });

  async function checkForUpdate(fromUpdate) {
    const hmrPrefix = '[\u001B[35mHMR\u001B[0m] ';
    if (!app.hot) {
      throw new Error(`${hmrPrefix}Hot Module Replacement is disabled.`);
    }
    if (app.hot.status() !== 'idle') {
      return Promise.resolve();
    }
    try {
      const updatedModules = await app.hot.check(true);
      if (!updatedModules) {
        if (fromUpdate) {
          console.info(`${hmrPrefix}Update applied.`);
        }
        return undefined;
      }
      if (updatedModules.length === 0) {
        console.info(`${hmrPrefix}Nothing hot updated.`);
      } else {
        console.info(`${hmrPrefix}Updated modules:`);
        forEach(updatedModules, moduleId =>
          console.info(`${hmrPrefix} - ${moduleId}`),
        );
        checkForUpdate(true);
      }
    } catch (error) {
      if (includes(['abort', 'fail'], app.hot.status())) {
        console.warn(`${hmrPrefix}Cannot apply update.`);
        delete require.cache[require.resolve('../build/server')];
        // eslint-disable-next-line global-require, import/no-unresolved
        app = require('../build/server').default;
        console.warn(`${hmrPrefix}App has been reloaded.`);
      } else {
        console.warn(
          `${hmrPrefix}Update failed: ${error.stack || error.message}`,
        );
      }
    }
    return undefined;
  }

  serverCompiler.watch(watchOptions, async (error, stats) => {
    if (app && !error && !stats.hasErrors()) {
      await checkForUpdate();
      appPromiseIsResolved = true;
      appPromiseResolve();
    }
  });

  // Wait until both client-side and server-side bundles are ready
  await clientPromise;
  await serverPromise;

  const timeStart = new Date();
  console.info(`[${format(timeStart)}] Launching server...`);

  // Load compiled src/server.js as a middleware
  // eslint-disable-next-line global-require, import/no-unresolved
  app = require('../build/server').default;
  appPromiseIsResolved = true;
  appPromiseResolve();

  // Launch the development server with Browsersync and HMR
  await new Promise((resolve, reject) =>
    browserSync.create().init(
      {
        // https://www.browsersync.io/docs/options
        middleware: [server],
        open: !includes(process.argv, '--silent'),
        server: 'src/server.js',
        ...(isDebug ? {} : { notify: false, ui: false }),
      },
      (error, bs) => (error ? reject(error) : resolve(bs)),
    ),
  );

  const timeEnd = new Date();
  const time = timeEnd.getTime() - timeStart.getTime();
  console.info(`[${format(timeEnd)}] Server launched after ${time} ms`);
  return server;
}

export default start;
