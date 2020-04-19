import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import as from './as';
import calcTable from './calc-table';
import calcDeltaMinus from './calc-delta-minus';
import calcDeltaPlus from './calc-delta-plus';

export default combineReducers({
  as,
  calcTable,
  calcDeltaMinus,
  calcDeltaPlus,
  form: formReducer,
});
