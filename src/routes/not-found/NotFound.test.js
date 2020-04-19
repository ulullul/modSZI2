import { render } from 'enzyme';
import React from 'react';
import NotFound from './NotFound';

describe('dashboard route', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const link = render(<NotFound title="Page Not Found" />);
    expect(link).toMatchInlineSnapshot(`
      <div
        class="root"
      >
        <div
          class="container"
        >
          <h1>
            Page Not Found
          </h1>
          <p>
            Sorry, the page you were trying to view does not exist.
          </p>
        </div>
      </div>
    `);
  });
});
