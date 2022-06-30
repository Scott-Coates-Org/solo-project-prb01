import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { useEffect } from "react";

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

export const createSpotifyAuth = createAsyncThunk(
  "spotify/createSpotifyAuth",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(getData());
      const response = await _getAccessToken(payload.code, payload.state, payload.redirectURI);
      thunkAPI.dispatch(getDataSuccess(response));
    } catch (error) {
      thunkAPI.dispatch(getDataFailure(error));

    }
  }
);

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

async function _getAccessToken(code, state, redirectURI) {
  if (state !== spotifyState) {
    return console.log("States are not the same");
  }

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "authorization_code");
  formBody.set("code", code);
  formBody.set("redirect_uri", redirectURI);

  const response = await fetch(`${baseURI}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + new Buffer(clientId + ":" + clientSecret).toString("base64"),
    },
    body: formBody,
  });

  return response.json();
}

async function _getRefreshedAccessToken(refreshToken, redirectURI) {
  const formBody = new URLSearchParams();
  formBody.set("grant_type", "refresh_token");
  formBody.set("refresh_token", refreshToken);
  formBody.set("redirect_uri", redirectURI);

  const response = await fetch(`${baseURI}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + new Buffer(clientId + ":" + clientSecret).toString("base64"),
    },
    body: formBody,
  });

  return response.json();
}

async function _getMe(access_token) {
  const response = await fetch(`${apiURI}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  });

  return response.json();
}

async function _getPlaylists(user, access_token, uri = null) {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  const response = await fetch(
    uri || `${apiURI}/users/${user}/playlists?offset=0&limit=50`,
    opts
  );

  return response.json();
}
