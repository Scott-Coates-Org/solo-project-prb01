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

exports.getPlaylists = functions.https.onCall(async (data, context) => {
  const { user, access_token, uri } = data;
  const opts = {
    url: uri || `${apiURI}/users/${user}/playlists?offset=0&limit=50`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };
  console.log({ uri });

  return spotifyAPICalls(context, opts);
});

exports.getPlaylist = functions.https.onCall(async (data, context) => {
  const { playlist_id, access_token } = data;

  checkUserLoggedIn(context);

  try {
    const response = await axios({
      url: `${apiURI}/playlists/${playlist_id}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access_token,
      },
    });

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
});

// export async function _getPlaylists(user, access_token, uri = null) {
//   const opts = {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + access_token,
//     },
//   };

//   const response = await fetch(
//     uri || `${apiURI}/users/${user}/playlists?offset=0&limit=50`,
//     opts
//   );

//   return response;
// }

// export async function _getPlaylist(playlist_id, access_token) {
//   const opts = {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + access_token,
//     },
//   };

//   const response = await fetch(`${apiURI}/playlists/${playlist_id}`, opts);

//   return response;
// }
