import property from 'lodash/property';
import times from 'lodash/times';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import Cell from './Cell';

export default function Row({ j }) {
  const numberOfColumns =
    useSelector(property('calcTable.numberOfColumns')) || 0;
  return (
    <tr>
      {times(numberOfColumns, i => (
        <Cell key={i} i={i} j={j} />
      ))}
    </tr>
  );
}
Row.propTypes = {
  j: PropTypes.number.isRequired,
};
