import concat from 'lodash/concat';
import constant from 'lodash/constant';
import get from 'lodash/get';
import map from 'lodash/map';
import take from 'lodash/take';
import times from 'lodash/times';
import {
  CHANGE_CELL_VALUE,
  CHANGE_FUZZY,
  CHANGE_NUM_OF_COLUMNS,
  CHANGE_NUM_OF_ROWS,
} from '../constants';

export default function calcTable(state = {}, action) {
  let { newValue = 0 } = action;
  let table = get(state, 'table', []);
  let row;
  const numberOfColumns = get(state, 'numberOfColumns', 0);
  const numberOfRows = get(state, 'numberOfRows', 0);
  let isFuzzy = get(state, 'isFuzzy', false);
  // console.log(action)
  const { type, j, i } = action;
  switch (type) {
    case CHANGE_CELL_VALUE: {
      table = Array.from(table);
      row = Array.from(table[j]);
      row[i] = newValue;
      table[j] = row;
      return {
        ...state,
        table,
      };
    }
    case CHANGE_NUM_OF_ROWS:
      if (newValue < 0) {
        newValue = 0;
      }
      if (newValue === numberOfRows) {
        return state;
      }
      if (newValue < numberOfRows) {
        table = take(table, newValue);
      } else {
        table = Array.from(table);
        table = concat(
          table,
          times(newValue - numberOfRows, () =>
            times(numberOfColumns, constant(0)),
          ),
        );
      }
      return {
        ...state,
        numberOfRows: newValue,
        table,
      };
    case CHANGE_NUM_OF_COLUMNS:
      if (newValue < 0) {
        newValue = 0;
      }
      if (newValue === numberOfColumns) {
        return state;
      }
      if (newValue < numberOfColumns) {
        table = map(table, rowItem => take(rowItem, newValue));
      } else {
        table = map(table, rowItem =>
          concat(rowItem, times(newValue - numberOfColumns, constant(0))),
        );
      }
      return {
        ...state,
        numberOfColumns: newValue,
        table,
      };
    case CHANGE_FUZZY:
      isFuzzy = newValue;
      return {
        ...state,
        isFuzzy,
      };
    default:
      return state;
  }
}
