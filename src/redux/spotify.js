import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
};

const spotify = createSlice({
  name: "spotify",
  initialState,
  reducers: {
    getData: (state) => {},

    getDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = action.payload;
    },

    getDataFailure: (state) => {
      state.isLoaded = true;
      state.hasErrors = true;
    },
    appendData: (state, action) => {
      state.isLoaded = true;
      state.data = { ...state.data, ...action.payload };
    },
  },
});

export const reducer = spotify.reducer;

export const { getData, getDataSuccess, getDataFailure, appendData } = spotify.actions;

export const createSpotifyAuth = createAsyncThunk(
  "user/createSpotifyAuth",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(appendData(payload));
    } catch (error) {
      console.log(error);
    }
  }
);
