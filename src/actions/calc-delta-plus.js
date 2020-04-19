import {
  CHANGE_DELTA_PLUS_VALUE,
  CHANGE_NUM_OF_COLUMNS_DELTA_PLUS,
  CHANGE_NUM_OF_ROWS_DELTA_PLUS,
} from '../constants';

export function changeDeltaPlusValue(i, j, newValue) {
  return {
    i,
    j,
    newValue: parseFloat(newValue),
    type: CHANGE_DELTA_PLUS_VALUE,
  };
}

export function changeNumberOfRowsDeltaPlus(newValue) {
  return {
    newValue,
    type: CHANGE_NUM_OF_ROWS_DELTA_PLUS,
  };
}

export function changeNumberOfColumnsDeltaPlus(newValue) {
  return {
    newValue,
    type: CHANGE_NUM_OF_COLUMNS_DELTA_PLUS,
  };
}
