import fetch from 'node-fetch';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import App from './App';

function WrappedApp(props) {
  const { children, insertCss, path, query, store, token } = props;

  const context = useMemo(
    () => ({
      fetch,
      // The twins below are wild, be careful!
      pathname: path,
      query,
      // You can access redux through react-redux connect
      store,
      storeSubscription: null,
      token,
    }),
    [path, query, store, token],
  );
  const styleValue = useMemo(
    () => ({
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss,
    }),
    [insertCss],
  );
  return (
    <StyleContext.Provider value={styleValue}>
      <ReduxProvider store={store}>
        <App context={context}>{children}</App>
      </ReduxProvider>
    </StyleContext.Provider>
  );
}
WrappedApp.propTypes = {
  children: PropTypes.node.isRequired,
  insertCss: PropTypes.func.isRequired,
  path: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  query: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  token: PropTypes.any,
};
WrappedApp.defaultProps = {
  path: '',
  query: {},
  token: undefined,
};
export default WrappedApp;
