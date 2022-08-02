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
  folders: [],
 
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
    getFolsersSuccess(state, action) {
      state.isLoading = false;
      state.folders = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;




// ----------------------------------------------------------------------

export function getFolders() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('http://localhost:4000/folder/getAllFoldersOfApp');
      dispatch(slice.actions.getFolsersSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
