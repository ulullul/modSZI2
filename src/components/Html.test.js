import { render } from 'enzyme';
import React from 'react';
import Html from './Html';

const dummyAppState = {};
describe('html component', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const html = render(
      <Html app={dummyAppState} description="test" title="Test">
        Hello
      </Html>,
    );
    expect(html).toMatchInlineSnapshot(`
      Array [
        <meta
          charset="utf-8"
        />,
        <meta
          content="ie=edge"
          http-equiv="x-ua-compatible"
        />,
        <title>
          Test
        </title>,
        <meta
          content="test"
          name="description"
        />,
        <meta
          content="width=device-width, initial-scale=1"
          name="viewport"
        />,
        <link
          href="/site.webmanifest"
          rel="manifest"
        />,
        <link
          href="https://fonts.googleapis.com/"
          rel="preconnect"
        />,
        <link
          href="/icon.png"
          rel="apple-touch-icon"
        />,
        <div
          id="app"
        >
          Hello
        </div>,
        <script>
          window.App={}
        </script>,
      ]
    `);
  });
});
