import concat from 'lodash/concat';
import constant from 'lodash/constant';
import get from 'lodash/get';
import map from 'lodash/map';
import take from 'lodash/take';
import times from 'lodash/times';
import {
  CHANGE_DELTA_MINUS_VALUE,
  CHANGE_NUM_OF_COLUMNS_DELTA_MINUS,
  CHANGE_NUM_OF_ROWS_DELTA_MINUS,
} from '../constants';

export default function calcDeltaMinus(state = {}, action) {
  // console.log(state);
  let { newValue = 0 } = action;
  let tableMinus = get(state, 'tableMinus', []);
  // console.log(table)
  let row;
  // console.log(action)
  const numberOfColumns = get(state, 'numberOfColumnsDeltaMinus', 0);
  const numberOfRows = get(state, 'numberOfRowsDeltaMinus', 0);
  const { type, j, i } = action;
  switch (type) {
    case CHANGE_DELTA_MINUS_VALUE: {
      tableMinus = Array.from(tableMinus);
      row = Array.from(tableMinus[j]);
      row[i] = newValue;
      tableMinus[j] = row;
      return {
        ...state,
        tableMinus,
      };
    }
    case CHANGE_NUM_OF_ROWS_DELTA_MINUS:
      if (newValue < 0) {
        newValue = 0;
      }
      if (newValue === numberOfRows) {
        return state;
      }
      if (newValue < numberOfRows) {
        tableMinus = take(tableMinus, newValue);
      } else {
        tableMinus = Array.from(tableMinus);
        tableMinus = concat(
          tableMinus,
          times(newValue - numberOfRows, () =>
            times(numberOfColumns, constant(0)),
          ),
        );
      }
      return {
        ...state,
        numberOfRowsDeltaMinus: newValue,
        tableMinus,
      };
    case CHANGE_NUM_OF_COLUMNS_DELTA_MINUS:
      if (newValue < 0) {
        newValue = 0;
      }
      if (newValue === numberOfColumns) {
        return state;
      }
      if (newValue < numberOfColumns) {
        tableMinus = map(tableMinus, rowItem => take(rowItem, newValue));
      } else {
        tableMinus = map(tableMinus, rowItem =>
          concat(rowItem, times(newValue - numberOfColumns, constant(0))),
        );
      }
      return {
        ...state,
        numberOfColumnsDeltaMinus: newValue,
        tableMinus,
      };
    default:
      return state;
  }
}
