const axios = require("axios").default;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const apiURI = "https://api.spotify.com/v1";

// common error to check that user is logged in to run function
const checkUserLoggedIn = (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
};

const spotifyAPICalls = async (context, opts) => {
  checkUserLoggedIn(context);

  try {
    const response = await axios(opts);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a non 2.x.x status
      throw new functions.https.HttpsError("unknown", error.message);
    } else if (error.request) {
      // The request was made but no response was received
      throw new functions.https.HttpsError("unavailable", "No response received.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
  }
};

exports.getAccessToken = functions.https.onCall(async (data, context) => {
  const { code, state, redirectURI } = data;

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "authorization_code");
  formBody.set("code", code);
  formBody.set("redirect_uri", redirectURI);

  const opts = {
    url: `${baseURI}/api/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    data: formBody,
  };

  if (state !== spotifyState) {
    throw new functions.https.HttpsError("invalid-argument", "States are not the same");
  }

  return spotifyAPICalls(context, opts);
});

exports.getRefreshedAccessToken = functions.https.onCall(async (data, context) => {
  const { refreshToken, redirectURI } = data;

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "refresh_token");
  formBody.set("refresh_token", refreshToken);
  formBody.set("redirect_uri", redirectURI);

  const opts = {
    url: `${baseURI}/api/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    data: formBody,
  };

  return spotifyAPICalls(context, opts);
});

exports.getMe = functions.https.onCall(async (data, context) => {
  const { access_token } = data;
  const opts = {
    url: `${apiURI}/me`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
});

const getPlaylists = (user, access_token, uri, context) => {
  const opts = {
    url: uri || `${apiURI}/users/${user}/playlists?offset=0&limit=50`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

exports.getAllPlaylists = functions.https.onCall(async (data, context) => {
  const { user, access_token } = data;
  const playlists = [];
  let response = { next: "first" };

  while (response.next) {
    response = await getPlaylists(
      user,
      access_token,
      response.next === "first" ? null : response.next,
      context
    );

    playlists.push(...response.items);
  }

  return playlists;
});

exports.getPlaylist = functions.https.onCall(async (data, context) => {
  const { playlist_id, access_token } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
});

const getSongsFromPlaylist = (playlist_id, access_token, uri, context) => {
  const opts = {
    url: uri || `${apiURI}/playlists/${playlist_id}/tracks?limit=50`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

exports.getAllSongsFromPlaylist = functions.https.onCall(async (data, context) => {
  const { playlist_id, access_token } = data;
  const songs = [];
  let response = { next: "first" };

  while (response.next) {
    response = await getSongsFromPlaylist(
      playlist_id,
      access_token,
      response.next === "first" ? null : response.next,
      context
    );

    songs.push(...response.items);
  }

  return songs;
});

//API call to delete songs from playlist
//Can only delete 100 at a time
//Tracks are in array json format: {"tracks": [{ "uri": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh" },{ "uri": "spotify:track:1301WleyT98MSxVHPZCA6M" }] }
exports.deleteSongsFromPlaylist = functions.https.onCall(async (data, context) => {
  const { playlist_id, access_token, tracks } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/tracks`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(tracks),
  };

  return spotifyAPICalls(context, opts);
});