import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import isomorphicCookie from 'isomorphic-cookie';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import invoke from 'lodash/invoke';
import set from 'lodash/set';
import nodeFetch from 'node-fetch';
import path from 'path';
import PrettyError from 'pretty-error';
import React from 'react';
import ReactDOM from 'react-dom/server';
import Html from './components/Html';
import WrappedApp from './components/WrappedApp';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import router from './router';
// import assets from './asset-manifest.json'; // eslint-disable-line import/no-unresolved
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved
import config from './config';
import configureStore from './store/configure-store';
import initialState from './initial-state.json';

function getCss() {
  const css = new Set();
  return [
    css,
    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      forEach(styles, style => css.add(style._getCss()));
    },
  ];
}
const FOUND = 302;
const INTERNAL_SERVER_ERROR = 500;
const OK = 200;

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  // send entire app down. Process manager will restart it
  process.exit(1);
});

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
set(global, 'navigator.userAgent', get(global, 'navigator.userAgent') || 'all');

const app = express();

//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
app.set('trust proxy', config.trustProxy);

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (request, response, next) => {
  try {
    const [css, insertCss] = getCss();

    const store = configureStore(initialState, {
      fetch: nodeFetch,
      // I should not use `history` on server.. but how I do redirection? follow universal-router
    });

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      fetch: nodeFetch,
      // The twins below are wild, be careful!
      pathname: request.path,
      query: request.query,
      // You can access redux through react-redux connect
      store,
      storeSubscription: null,
      token: isomorphicCookie.load('user_token', request),
    };

    const route = await router.resolve(context);

    if (route.redirect) {
      response.redirect(route.status || FOUND, route.redirect);
      return;
    }

    const data = { ...route };
    data.children = ReactDOM.renderToString(
      <WrappedApp
        insertCss={insertCss}
        path={context.pathname}
        query={context.query}
        store={store}
        token={context.token}
      >
        {route.component}
      </WrappedApp>,
    );
    data.styles = [{ cssText: Array.from(css).join(''), id: 'css' }];

    const scripts = new Set();
    const addChunk = chunk => {
      const assets = get(chunks, chunk);
      if (assets) {
        forEach(assets, asset => scripts.add(asset));
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`);
      }
    };
    addChunk('client');
    if (route.chunk) addChunk(route.chunk);
    forEach(route.chunks, addChunk);

    data.scripts = Array.from(scripts);
    data.app = {
      apiUrl: get(config, 'api.clientUrl'),
    };

    // eslint-disable-next-line react/jsx-props-no-spreading
    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    response.status(route.status || OK);
    response.send(`<!doctype html>${html}`);
  } catch (error) {
    next(error);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) => {
  console.error(pe.render(error));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      description={error.message}
      // eslint-disable-next-line no-underscore-dangle, react-perf/jsx-no-new-array-as-prop
      styles={[{ cssText: errorPageStyle._getCss(), id: 'css' }]}
      title="Internal Server Error"
    >
      {ReactDOM.renderToString(<ErrorPageWithoutStyle error={error} />)}
    </Html>,
  );
  response.status(error.status || INTERNAL_SERVER_ERROR);
  response.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
if (!module.hot) {
  app.listen(config.port, () => {
    console.info(`The server is running at http://localhost:${config.port}/`);
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  invoke(module, 'hot.accept', './router');
}

export default app;
