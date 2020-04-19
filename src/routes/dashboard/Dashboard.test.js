import { render } from 'enzyme';
import React from 'react';
import Dashboard from './Dashboard';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}));

describe('dashboard route', () => {
  it('matches the snapshot', () => {
    expect.assertions(1);
    const link = render(<Dashboard />);
    expect(link).toMatchInlineSnapshot(`
      <div
        class="root"
      >
        <div
          class="container"
        >
          Smart Security Dashboard
        </div>
        <p>
          <label
            for="number-of-rows"
          >
            Number of rows: 
            <input
              id="number-of-rows"
              type="number"
              value="0"
            />
          </label>
          <label
            for="number-of-columns"
          >
            Number of columns: 
            <input
              id="number-of-columns"
              type="number"
              value="0"
            />
          </label>
        </p>
        <p>
          0
        </p>
        <p />
      </div>
    `);
  });
});
