import React from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Style from './Style';

describe('style component', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    let container = document.createElement('div');
    document.body.append(container);
    act(() => {
      render(
        <Style cssText=".someClass {background-color: red;}" id="some-id" />,
        container,
      );
    });
    const renderedStyle = document.getElementById('some-id');
    expect(renderedStyle).toMatchInlineSnapshot(`
      <style
        id="some-id"
      >
        .someClass {background-color: red;}
      </style>
    `);
    document.body.removeChild(container);
    container = null;
  });
});
