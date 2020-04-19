import noop from 'lodash/noop';
import React from 'react';
import { render } from 'enzyme';
import App from './App';

const dummyContext = {
  fetch: noop,
  pathname: '',
  query: {},
  store: {},
  storeSubscription: null,
  token: null,
};

describe('app component', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const app = render(
      <App context={dummyContext}>
        <span>ololo</span>
      </App>,
    );
    expect(app).toMatchInlineSnapshot(`
      <span>
        ololo
      </span>
    `);
  });
});
