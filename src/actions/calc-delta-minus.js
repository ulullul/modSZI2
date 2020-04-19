import {
  CHANGE_DELTA_MINUS_VALUE,
  CHANGE_NUM_OF_COLUMNS_DELTA_MINUS,
  CHANGE_NUM_OF_ROWS_DELTA_MINUS,
} from '../constants';

export function changeDeltaMinusValue(i, j, newValue) {
  return {
    i,
    j,
    newValue: parseFloat(newValue),
    type: CHANGE_DELTA_MINUS_VALUE,
  };
}

export function changeNumberOfRowsDeltaMinus(newValue) {
  return {
    newValue,
    type: CHANGE_NUM_OF_ROWS_DELTA_MINUS,
  };
}

export function changeNumberOfColumnsDeltaMinus(newValue) {
  return {
    newValue,
    type: CHANGE_NUM_OF_COLUMNS_DELTA_MINUS,
  };
}
