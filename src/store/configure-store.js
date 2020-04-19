import invoke from 'lodash/invoke';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { name, version } from '../../package.json';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const middleware = [thunk];

  let enhancer;

  if (__DEV__) {
    // eslint-disable-next-line global-require
    const createLogger = require('./logger').default;
    const {
      composeWithDevTools,
      // eslint-disable-next-line global-require
    } = require('redux-devtools-extension/developmentOnly');

    // eslint-disable-next-line global-require
    middleware.push(createLogger());

    // https://github.com/zalmoxisus/redux-devtools-extension#14-using-in-production
    const composeEnhancers = composeWithDevTools({
      // Options: https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md#options
      name: `${name}@${version}`,
    });

    // https://redux.js.org/docs/api/applyMiddleware.html
    enhancer = composeEnhancers(applyMiddleware(...middleware));
  } else {
    enhancer = applyMiddleware(...middleware);
  }

  // https://redux.js.org/docs/api/createStore.html
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (__DEV__ && module.hot) {
    invoke(module, 'hot.accept', '../reducers', () =>
      // eslint-disable-next-line global-require
      store.replaceReducer(require('../reducers').default),
    );
  }

  return store;
}
