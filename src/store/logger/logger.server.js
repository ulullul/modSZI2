import isUndefined from 'lodash/isUndefined';
import { inspect } from 'util';

function inspectObject(object) {
  return inspect(object, {
    colors: true,
  });
}

const getHandler = next => action => {
  let formattedPayload = '';
  if (action.toString !== Object.prototype.toString) {
    formattedPayload = action.toString();
  } else if (isUndefined(action.payload)) {
    formattedPayload = inspectObject(action.payload);
  } else {
    formattedPayload = inspectObject(action);
  }

  console.log(` * ${action.type}: ${formattedPayload}`); // eslint-disable-line no-console
  return next(action);
};

// Server side redux action logger
export default function createLogger() {
  // eslint-disable-next-line no-unused-vars
  return () => getHandler;
}
