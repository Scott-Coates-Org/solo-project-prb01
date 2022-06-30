const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const apiURI = "https://api.spotify.com/v1";

export async function _getAccessToken(code, state, redirectURI) {
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

export async function _getRefreshedAccessToken(refreshToken, redirectURI) {
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

export async function _getMe(access_token) {
  const response = await fetch(`${apiURI}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  });

  return response.json();
}

export async function _getPlaylists(user, access_token, uri = null) {
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
