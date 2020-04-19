import { render } from 'enzyme';
import React from 'react';
import Layout from '.';

describe('layout', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const link = render(
      <Layout>
        <h1>Hello!</h1>
      </Layout>,
    );
    expect(link).toMatchInlineSnapshot(`
      <div
        class="container-fluid"
      >
        <h1>
          Hello!
        </h1>
      </div>
    `);
  });
});
