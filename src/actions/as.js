import fetch from 'node-fetch';
import {
  FETCH_DATA_START,
  FETCH_DATA_FAILURE,
  FETCH_DATA_SUCCESS,
} from '../constants';

function fetchDataStart() {
  return {
    type: FETCH_DATA_START,
  };
}
function fetchDataFailure(error) {
  return {
    type: FETCH_DATA_FAILURE,
    error,
  };
}
function fetchDataSuccess(data) {
  return {
    type: FETCH_DATA_SUCCESS,
    data,
  };
}

export default function fetchData() {
  return async dispatch => {
    dispatch(fetchDataStart());
    try {
      const response = await fetch(
        '//ws.audioscrobbler.com/2.0/?method=album.gettoptags&api_key=991eacc4ca058d68ec446983c0ddd04d&artist=venom&album=cast%20in%20stone&format=json',
      );
      const data = await response.json();
      return dispatch(fetchDataSuccess(data.toptags));
    } catch (error) {
      return dispatch(fetchDataFailure(error));
    }
  };
}
