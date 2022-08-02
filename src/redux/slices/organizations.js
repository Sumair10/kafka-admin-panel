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
  organizations: [],
 
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
    getOrganizationsSuccess(state, action) {
      state.isLoading = false;
      state.organizations = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;




// ----------------------------------------------------------------------

export function getOrganizations() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('http://localhost:4000/org/getAllOrganizations');
      dispatch(slice.actions.getOrganizationsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
