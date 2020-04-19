import get from 'lodash/get';
import property from 'lodash/property';
import times from 'lodash/times';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import isNaN from 'lodash/isNaN';
import isUndefined from 'lodash/isUndefined';
import classNames from 'classnames';
import map from 'lodash/map';
import s from './Dashboard.css';
import fetchData from '../../actions/as';
import Row from './Row';
import {
  changeNumberOfRows,
  changeNumberOfColumns,
  showFuzzy,
} from '../../actions/calc-table';
import {
  changeNumberOfColumnsDeltaMinus,
  changeNumberOfRowsDeltaMinus,
} from '../../actions/calc-delta-minus';
import {
  changeNumberOfColumnsDeltaPlus,
  changeNumberOfRowsDeltaPlus,
} from '../../actions/calc-delta-plus';
import Fuzy from './Fuzy';

function Dashboard() {
  useStyles(s);
  const dispatch = useDispatch();

  const table = useSelector(property('calcTable.table')) || undefined;
  const tableDeltaMinus = useSelector(property('calcDeltaMinus.tableMinus'));
  const tableDeltaPlus = useSelector(property('calcDeltaPlus.tablePlus'));
  const numberOfRows =
    useSelector(property('calcTable.numberOfRows'), shallowEqual) || 0;
  const numberOfColumns =
    useSelector(property('calcTable.numberOfColumns'), shallowEqual) || 0;
  const sumOfCells = useMemo(() => {
    const finalStrings = [];
    let temporaryResult = 1;
    const fuzy = new Fuzy();
    if (!isUndefined(table) && !isUndefined(table[0])) {
      const { length } = table[0];

      for (let col = 0; col < length; col += 1) {
        for (const [row, element] of table.entries()) {
          if (isNaN(element[col])) {
            temporaryResult = fuzy.mul(temporaryResult, 0);
          } else {
            const fuzyTable = {
              number: element[col],
              deltaMin: tableDeltaMinus[row][col],
              deltaMax: tableDeltaPlus[row][col],
            };
            temporaryResult = fuzy.mul(temporaryResult, fuzy.sub(1, fuzyTable));
          }
        }
        finalStrings.push(fuzy.sub(1, temporaryResult));
        temporaryResult = 1;
      }
      return finalStrings;
    }
    return 'Введіть дані в таблицю';
  }, [table, tableDeltaMinus, tableDeltaPlus]);

  const range = useMemo(() => {
    const tableThreats = sumOfCells || [];
    let minimalThreats = {
      number: 1000,
      col: null,
      row: null,
    };
    let temporaryResult = 0;
    if (!isUndefined(table) && !isUndefined(table[0])) {
      const { length } = table[0];
      for (let col = 0; col < length; col++) {
        for (const [row, element] of table.entries()) {
          temporaryResult = tableThreats[col].number - element[col];
          if (
            temporaryResult < minimalThreats.number &&
            temporaryResult !== 0
          ) {
            minimalThreats = {
              number: temporaryResult,
              col,
              row,
            };
          }
        }
      }
    }
    return minimalThreats;
  }, [sumOfCells, table]);

  /* useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]); */
  const handleNumberOfRowsChange = useCallback(
    event => {
      let newValue = parseInt(get(event, 'target.value', 0));
      if (isNaN(newValue)) {
        newValue = 0;
      }
      dispatch(changeNumberOfRows(newValue));
      dispatch(changeNumberOfRowsDeltaMinus(newValue));
      dispatch(changeNumberOfRowsDeltaPlus(newValue));
    },
    [dispatch],
  );
  const handleNumberOfColumnsChange = useCallback(
    event => {
      let newValue = parseInt(get(event, 'target.value', 0));
      if (isNaN(newValue)) {
        newValue = 0;
      }
      dispatch(changeNumberOfColumns(newValue));
      dispatch(changeNumberOfColumnsDeltaMinus(newValue));
      dispatch(changeNumberOfColumnsDeltaPlus(newValue));
    },
    [dispatch],
  );
  const handleFuzzyChange = useCallback(
    event => {
      dispatch(showFuzzy(get(event, 'target.checked')));
    },
    [dispatch],
  );

  return (
    <div className={s.container}>
      <div className={s.controlContainer}>
        <label htmlFor="number-of-rows">
          Введіть кількість загроз:{' '}
          <input
            id="number-of-rows"
            onChange={handleNumberOfRowsChange}
            type="number"
            value={numberOfRows}
          />
        </label>
        <label htmlFor="number-of-columns">
          Введіть кількість ресурсів:{' '}
          <input
            id="number-of-columns"
            onChange={handleNumberOfColumnsChange}
            type="number"
            value={numberOfColumns}
          />
        </label>
        <label htmlFor="number-of-columns">
          Нечітке представлення:{' '}
          <input
            id="number-of-columns"
            onClick={handleFuzzyChange}
            type="checkbox"
          />
        </label>
      </div>
      <div className={s.tableContainer}>
        <table className={classNames('table', 'table-bordered')}>
          <tbody>
            {times(numberOfRows, j => (
              <Row key={j} j={j} />
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {map(
          sumOfCells,
          (element, i) =>
            numberOfRows > 0 &&
            numberOfColumns > 0 && (
              <span key={i}>
                Р(ресурс {i + 1}) ={' '}
                {`{ ${element.number}, ${element.deltaMin}, ${element.deltaMax} }`}{' '}
                <br />
              </span>
            ),
        )}
      </p>
      {numberOfRows > 0 && numberOfColumns > 0 && (
        <p>
          Найбільша загроза - [Загроза {range.row + 1}, Ресурс {range.col + 1}]:{' '}
          {table[range.row][range.col]}
        </p>
      )}
    </div>
  );
}

Dashboard.whyDidYouRender = true;
export default memo(Dashboard);
