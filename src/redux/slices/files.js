import { createSlice } from '@reduxjs/toolkit';
import sum from 'lodash/sum';
import uniqBy from 'lodash/uniqBy';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  files: [],
 
};

const slice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET PRODUCTS
    getFilesSuccess(state, action) {
      state.isLoading = false;
      state.files = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;




// ----------------------------------------------------------------------

export function getFiles() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('http://localhost:4000/file/getAllFilesOfApp');
      dispatch(slice.actions.getFilesSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
