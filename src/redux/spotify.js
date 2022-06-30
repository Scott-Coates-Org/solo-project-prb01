import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _getMe, _getPlaylists } from "components/services/spotifyService";


const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const apiURI = "https://api.spotify.com/v1";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  errorMsg: {},
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

    getDataFailure: (state, action) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    appendData: (state) => {
      state.isLoaded = false;
      state.hasErrors = false;
      state.errorMsg = {};
    },
    appendDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = { ...state.data, ...action.payload };
    },
    appendDataFailure: (state, action) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
  },
});

export const reducer = spotify.reducer;

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  appendData,
  appendDataSuccess,
  appendDataFailure,
} = spotify.actions;

export const fetchSpotifyMe = createAsyncThunk(
  "spotify/fetchSpotifyMe",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(appendData());
      const response = await _getMe(payload.access_token);
      thunkAPI.dispatch(appendDataSuccess({ user: response }));
    } catch (error) {
      thunkAPI.dispatch(appendDataFailure(error));
    }
  }
);

export const fetchSpotifyPlaylists = createAsyncThunk(
  "spotify/fetchSpotifyPlaylists",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(appendData());
      const playlists = []
      let response = await _getPlaylists(payload.user, payload.access_token);
      playlists.push(...response.items)

      while (response.next) {
      console.log(response.next);
        response = await _getPlaylists(payload.user, payload.access_token, response.next);
        playlists.push(...response.items);
      }
      thunkAPI.dispatch(appendDataSuccess({ playlists: playlists }));
    } catch (error) {
      thunkAPI.dispatch(appendDataFailure(error));
    }
  }
);