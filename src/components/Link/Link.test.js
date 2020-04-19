import { render } from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Link, { isExternal } from '.';

describe('isExternal', () => {
  it('returns true on external links', () => {
    expect.assertions(2);
    expect(isExternal('https://google.com')).toStrictEqual(true);
    expect(isExternal('http://google.com')).toStrictEqual(true);
  });
  it('returns false on internal links', () => {
    expect.assertions(2);
    expect(isExternal('/')).toStrictEqual(false);
    expect(isExternal('/anything')).toStrictEqual(false);
  });
});

describe('link to google', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const link = render(<Link to="https://google.com">Google</Link>);
    expect(link).toMatchInlineSnapshot(`
      <a
        class=""
        href="https://google.com"
        target="_blank"
      >
        Google
      </a>
    `);
  });
});

describe('link to dashboard', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const link = render(<Link to="/">Home</Link>);
    expect(link).toMatchInlineSnapshot(`
      <a
        class=""
        href="/"
      >
        Home
      </a>
    `);
  });
  it('accepts className prop', () => {
    expect.assertions(1);
    const link = render(
      <Link className="custom-class" to="/">
        Home
      </Link>,
    );
    expect(link).toMatchInlineSnapshot(`
      <a
        class="custom-class"
        href="/"
      >
        Home
      </a>
    `);
  });
});
describe('link with onClick handler', () => {
  it('responds to clicks', () => {
    expect.assertions(1);
    let run = false;
    function setRunToTrue() {
      run = true;
    }
    let container = document.createElement('div');
    document.body.append(container);
    act(() => {
      ReactDOM.render(
        <Link onClick={setRunToTrue} to="https://google.com">
          Run
        </Link>,
        container,
      );
    });
    const button = container.getElementsByTagName('a')[0];
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(run).toStrictEqual(true);
    document.body.removeChild(container);
    container = null;
  });
});
