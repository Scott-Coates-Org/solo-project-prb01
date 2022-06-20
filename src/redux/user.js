// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    getData: (state) => {
    },

    getDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = action.payload;
    },

    getDataFailure: (state) => {
      state.isLoaded = true;
      state.hasErrors = true;
    },
  }
});

export const reducer = user.reducer;

export const {
  getData, getDataSuccess, getDataFailure
} = user.actions;
