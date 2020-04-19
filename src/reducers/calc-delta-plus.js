import concat from 'lodash/concat';
import constant from 'lodash/constant';
import get from 'lodash/get';
import map from 'lodash/map';
import take from 'lodash/take';
import times from 'lodash/times';
import {
  CHANGE_DELTA_PLUS_VALUE,
  CHANGE_NUM_OF_COLUMNS_DELTA_PLUS,
  CHANGE_NUM_OF_ROWS_DELTA_PLUS,
} from '../constants';

export default function calcDeltaPlus(state = {}, action) {
  let { newValue = 0 } = action;
  let tablePlus = get(state, 'tablePlus', []);
  let row;
  const numberOfColumns = get(state, 'numberOfColumnsDeltaPlus', 0);
  const numberOfRows = get(state, 'numberOfRowsDeltaPlus', 0);
  const { type, j, i } = action;
  switch (type) {
    case CHANGE_DELTA_PLUS_VALUE: {
      tablePlus = Array.from(tablePlus);
      row = Array.from(tablePlus[j]);
      row[i] = newValue;
      tablePlus[j] = row;
      return {
        ...state,
        tablePlus,
      };
    }
    case CHANGE_NUM_OF_ROWS_DELTA_PLUS:
      if (newValue < 0) {
        newValue = 0;
      }
      if (newValue === numberOfRows) {
        return state;
      }
      if (newValue < numberOfRows) {
        tablePlus = take(tablePlus, newValue);
      } else {
        tablePlus = Array.from(tablePlus);
        tablePlus = concat(
          tablePlus,
          times(newValue - numberOfRows, () =>
            times(numberOfColumns, constant(0)),
          ),
        );
      }
      return {
        ...state,
        numberOfRowsDeltaPlus: newValue,
        tablePlus,
      };
    case CHANGE_NUM_OF_COLUMNS_DELTA_PLUS:
      if (newValue < 0) {
        newValue = 0;
      }
      if (newValue === numberOfColumns) {
        return state;
      }
      if (newValue < numberOfColumns) {
        tablePlus = map(tablePlus, rowItem => take(rowItem, newValue));
      } else {
        tablePlus = map(tablePlus, rowItem =>
          concat(rowItem, times(newValue - numberOfColumns, constant(0))),
        );
      }
      return {
        ...state,
        numberOfColumnsDeltaPlus: newValue,
        tablePlus,
      };
    default:
      return state;
  }
}
