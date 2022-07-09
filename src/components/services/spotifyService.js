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

export async function _getPlaylist(playlist_id, access_token) {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  const response = await fetch(
    `${apiURI}/playlists/${playlist_id}`,
    opts
  );

  return response.json();
}

export async function _getAllSongsFromPlaylist(playlist_id, access_token) {
  const songs = [];
  let response = await _getSongsFromPlaylist(playlist_id, access_token);
  songs.push(...response.items);

  while (response.next) {
    response = await _getSongsFromPlaylist(playlist_id, access_token, response.next);
    songs.push(...response.items);
  }

  return songs;
}

async function _getSongsFromPlaylist(playlist_id, access_token, uri = null) {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  const response = await fetch(
    uri || `${apiURI}/playlists/${playlist_id}/tracks?limit=50`,
    opts
  );

  return response.json();
}

//API call to delete songs from playlist
//Can only delete 100 at a time
//Tracks are in array json format: {"tracks": [{ "uri": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh" },{ "uri": "spotify:track:1301WleyT98MSxVHPZCA6M" }] }
export async function _deleteSongsFromPlaylist(playlist_id, access_token, tracks) {
  const opts = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: JSON.stringify(tracks),
  };

  const response = await fetch(`${apiURI}/playlists/${playlist_id}/tracks`, opts);

  return response.json();
}

//API call to create a new playlist for a specific user id
export async function _createPlaylist(user_id, access_token, name, description = "Combined playlist") {
  const data = {
    name,
    description
  }

  console.log(data)
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(`${apiURI}/users/${user_id}/playlists`, opts);

  return response.json();
}

//API call to add tracks to a playlist
//Can only add 100 tracks at a time
//Tracks are an array of spotify track uris {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M",
export async function _addSongsToPlaylist(playlist_id, access_token, uris) {
  const data = {
    uris
  }

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(`${apiURI}/playlists/${playlist_id}/tracks`, opts);

  return response.json();
}