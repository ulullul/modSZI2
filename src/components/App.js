import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Provider as ReduxProvider } from 'react-redux';

const ContextType = {
  // Universal HTTP client
  fetch: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  query: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  storeSubscription: PropTypes.any,
  token: PropTypes.string,
  ...ReduxProvider.childContextTypes,
};

/**
 * The top-level React component setting context (global) variables
 * that can be accessed from all the child components.
 *
 * https://facebook.github.io/react/docs/context.html
 *
 * Usage example:
 *
 *   const context = {
 *     history: createBrowserHistory(),
 *     store: createStore(),
 *   };
 *
 *   ReactDOM.render(
 *     <App context={context}>
 *       <Layout>
 *         <LandingPage />
 *       </Layout>
 *     </App>,
 *     container,
 *   );
 */
class App extends React.PureComponent {
  static propTypes = {
    children: PropTypes.element.isRequired,
    context: PropTypes.shape(ContextType).isRequired,
  };

  static childContextTypes = ContextType;

  getChildContext() {
    const { context } = this.props;
    return context;
  }

  static whyDidYouRender = true;

  render() {
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    const { children } = this.props;
    return React.Children.only(children);
  }
}

export default memo(App);
