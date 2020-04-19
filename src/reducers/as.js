import {
  FETCH_DATA_START,
  FETCH_DATA_FAILURE,
  FETCH_DATA_SUCCESS,
} from '../constants';

export default function calcTable(state = {}, action) {
  switch (action.type) {
    case FETCH_DATA_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_DATA_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: action.data,
      };
    default:
      return state;
  }
}
