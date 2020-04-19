import get from 'lodash/get';
import invoke from 'lodash/invoke';
import isFunction from 'lodash/isFunction';
import UniversalRouter from 'universal-router';
import routes from './routes';

const router = new UniversalRouter(routes, {
  async resolveRoute(context, parameters) {
    const load = get(context, 'route.load');
    if (isFunction(load)) {
      const action = await load();
      return invoke(action, 'default', context, parameters);
    }
    const action = get(context, 'route.action');
    if (isFunction(action)) {
      return action(context, parameters);
    }
    return undefined;
  },
});

export default router;
