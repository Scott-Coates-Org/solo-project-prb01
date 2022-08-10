import firebase from "firebase/app";
require("firebase/functions");
firebase.functions().useEmulator("localhost", 5001);

const apiURI = "https://api.spotify.com/v1";

async function getAccessToken(code, state, redirectURI) {
  const _getAccessToken = firebase.functions().httpsCallable("getAccessToken");
  const { data } = await _getAccessToken({ code, state, redirectURI });
  return data;
}

async function getRefreshedAccessToken(refreshToken, redirectURI) {
  const _getRefreshedAccessToken = firebase
    .functions()
    .httpsCallable("getRefreshedAccessToken");
  const { data } = await _getRefreshedAccessToken({ refreshToken, redirectURI });
  return data;
}

async function getMe(access_token) {
  const _getMe = firebase.functions().httpsCallable("getMe");
  const { data } = await _getMe({ access_token });
  return data;
}

async function getPlaylists(user, access_token, uri = null) {
  const _getPlaylists = firebase.functions().httpsCallable("getPlaylists");
  const { data } = await _getPlaylists({ user, access_token, uri });
  return data;
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

  return response;
}

export async function _getPlaylist(playlist_id, access_token) {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  const response = await fetch(`${apiURI}/playlists/${playlist_id}`, opts);

  return response;
}

export async function _getAllSongsFromPlaylist(playlist_id, access_token) {
  const songs = [];
  // let response = await _getSongsFromPlaylist(playlist_id, access_token);
  // songs.push(...response.items);

  // while (response.next) {
  //   response = await _getSongsFromPlaylist(playlist_id, access_token, response.next);
  //   songs.push(...response.items);
  // }

  let response = { next: "first" };

  while (response.next) {
    response = await _getSongsFromPlaylist(
      playlist_id,
      access_token,
      response.next === "first" ? null : response.next
    );

    if (response.status !== 200) {
      const errorMsg = await response.text();
      throw { message: errorMsg };
    }

    response = await response.json();
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

  return response;
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

  return response;
}

export async function _unfollowPlaylist(playlist_id, access_token) {
  const opts = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  const response = await fetch(`${apiURI}/playlists/${playlist_id}/followers`, opts);

  return response;
}

//API call to create a new playlist for a specific user id
export async function _createPlaylist(
  user_id,
  access_token,
  name,
  description = "Combined playlist"
) {
  const data = {
    name,
    description,
  };

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(`${apiURI}/users/${user_id}/playlists`, opts);

  return response;
}

//API call to add tracks to a playlist
//Can only add 100 tracks at a time
//Tracks are an array of spotify track uris {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M",
export async function _addSongsToPlaylist(playlist_id, access_token, uris) {
  const data = {
    uris,
  };

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(`${apiURI}/playlists/${playlist_id}/tracks`, opts);

  return response;
}

export const spotifyService = { getAccessToken, getRefreshedAccessToken, getMe, getPlaylists };
