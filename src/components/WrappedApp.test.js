import noop from 'lodash/noop';
import React from 'react';
import { render } from 'enzyme';
import WrappedApp from './WrappedApp';

const dummyQuery = {};
const dummyStore = {
  dispatch: noop,
  getState: noop,
  subscribe: noop,
};

describe('wrapped app component', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const app = render(
      <WrappedApp
        insertCss={noop}
        path=""
        query={dummyQuery}
        store={dummyStore}
        token=""
      >
        <span>ololo</span>
      </WrappedApp>,
    );
    expect(app).toMatchInlineSnapshot(`
      <span>
        ololo
      </span>
    `);
  });
});
