import invoke from 'lodash/invoke';
import nth from 'lodash/nth';

const routes = [
  {
    action({ next }) {
      return next();
    },
    children: [],
    path: '',
  },
  {
    async action({ next }) {
      // Execute each child route until one of them return the result
      const route = await next();

      // Provide default values for title, description etc.
      route.title = `Практична 2`;
      route.description = route.description || '';

      return route;
    },
    // Keep in mind, routes are evaluated in order
    children: [
      {
        load: () => import(/* webpackChunkName: 'dashboard' */ './dashboard'),
        path: '',
      },
    ],
    path: '',
    protected: true,
  },
];

// The error page is available by permanent url for development mode
if (__DEV__) {
  invoke(nth(routes, 1), 'children.unshift', {
    // eslint-disable-next-line global-require
    action: require('./error').default,
    path: '/error',
  });
}

export default routes;
