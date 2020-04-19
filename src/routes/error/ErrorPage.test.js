import { render } from 'enzyme';
import React from 'react';
import ErrorPage from './ErrorPage';

describe('dashboard route', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const link = render(<ErrorPage />);
    expect(link).toMatchInlineSnapshot(`
      <div>
        <h1>
          Error
        </h1>
        <p>
          Sorry, a critical error occurred on this page.
        </p>
      </div>
    `);
  });
});
