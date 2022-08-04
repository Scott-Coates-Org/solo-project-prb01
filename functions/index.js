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

exports.getAccessToken = functions.https.onCall(async (data, context) => {
  const { code, state, redirectURI } = data;

  checkUserLoggedIn(context);

  if (state !== spotifyState) {
    throw new functions.https.HttpsError("invalid-argument", "States are not the same");
  }

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "authorization_code");
  formBody.set("code", code);
  formBody.set("redirect_uri", redirectURI);

  try {
    const response = await axios({
      url: `${baseURI}/api/token`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      data: formBody,
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

exports.getRefreshedAccessToken = functions.https.onCall(async (data, context) => {
  const { refreshToken, redirectURI } = data;

  checkUserLoggedIn(context);

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "refresh_token");
  formBody.set("refresh_token", refreshToken);
  formBody.set("redirect_uri", redirectURI);

  try {
    const response = await axios({
      url: `${baseURI}/api/token`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      data: formBody,
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
