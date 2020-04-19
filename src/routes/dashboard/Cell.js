import property from 'lodash/property';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import useStyles from 'isomorphic-style-loader/useStyles';
import classNames from 'classnames';
import s from './Dashboard.css';
import { changeCellValue } from '../../actions/calc-table';
import { changeDeltaMinusValue } from '../../actions/calc-delta-minus';
import { changeDeltaPlusValue } from '../../actions/calc-delta-plus';

export default function Cell({ i, j }) {
  useStyles(s);
  const dispatch = useDispatch();
  const isFuzzy = useSelector(property('calcTable.isFuzzy'));
  const handleChange = useCallback(
    event => dispatch(changeCellValue(i, j, event.target.value)),
    [dispatch, i, j],
  );
  const handleDeltaMinusChange = useCallback(
    event => {
      dispatch(changeDeltaMinusValue(i, j, event.target.value));
    },
    [dispatch, i, j],
  );
  const handleDeltaPlusChange = useCallback(
    event => {
      dispatch(changeDeltaPlusValue(i, j, event.target.value));
    },
    [dispatch, i, j],
  );

  const value = useSelector(
    property(`calcTable.table.${j}.${i}`),
    shallowEqual,
  );
  const deltaMinusValue = useSelector(
    property(`calcDeltaMinus.tableMinus.${j}.${i}`),
    shallowEqual,
  );
  const deltaPlusValue = useSelector(
    property(`calcDeltaPlus.tablePlus.${j}.${i}`),
    shallowEqual,
  );
  return (
    <th key={i} className={s.col} scope="col">
      {!isFuzzy ? (
        <div className={s.inputsContainer}>
          {j === 0 && (
            <span className={s.resourceNumber}>
              Ресурс {i + 1} <span className={s.arrowDown}>&#8594;</span>
            </span>
          )}
          {i === 0 && (
            <span className={s.threatNumber}>Загроза {j + 1} &#8594;</span>
          )}
          <input
            className={classNames('form-control')}
            max={1}
            min={0}
            onChange={handleChange}
            step={0.01}
            type="number"
            value={value}
          />
        </div>
      ) : (
        <div className={s.inputsContainer}>
          {j === 0 && (
            <span className={s.resourceNumber}>
              Ресурс {i + 1} <span className={s.arrowDown}>&#8594;</span>
            </span>
          )}
          {i === 0 && (
            <span className={s.threatNumber}>Загроза {j + 1} &#8594;</span>
          )}
          <div className={s.deltaInputContainer}>
            <span className={s.deltaSymbol}>a</span>
            <input
              className={classNames(
                'form-control',
                s.dataInput,
                s.dataInputForNumber,
              )}
              max={1}
              min={0}
              onChange={handleChange}
              step={0.01}
              type="number"
              value={value}
            />
          </div>
          <div className={s.deltaInputContainer}>
            <span className={s.deltaSymbol}>
              &Delta;<span className={s.deltaMinus}>-</span>
            </span>
            <input
              className={classNames('form-control', s.dataInput)}
              max={1}
              min={0}
              onChange={handleDeltaMinusChange}
              step={0.01}
              type="number"
              value={deltaMinusValue}
            />
          </div>
          <div className={s.deltaInputContainer}>
            <span className={s.deltaSymbol}>
              &Delta;<span className={s.deltaPlus}>+</span>
            </span>
            <input
              className={classNames('form-control', s.dataInput)}
              max={1}
              min={0}
              onChange={handleDeltaPlusChange}
              step={0.01}
              type="number"
              value={deltaPlusValue}
            />
          </div>
        </div>
      )}
    </th>
  );
}
Cell.propTypes = {
  className: PropTypes.string,
  i: PropTypes.number.isRequired,
  j: PropTypes.number.isRequired,
};
Cell.defaultProps = {
  className: undefined,
};
