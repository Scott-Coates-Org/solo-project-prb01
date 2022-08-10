import firebase from "firebase/app";
require("firebase/functions");
firebase.functions().useEmulator("localhost", 5001);

const apiURI = "https://api.spotify.com/v1";

async function cloudAPICall(cloudFunction, payload) {
  const _functionCall = firebase.functions().httpsCallable(cloudFunction);
  const { data } = await _functionCall(payload);
  return data;
}

async function getAccessToken(code, state, redirectURI) {
  return cloudAPICall("getAccessToken", { code, state, redirectURI });
}

async function getRefreshedAccessToken(refreshToken, redirectURI) {
  return cloudAPICall("getRefreshedAccessToken", { refreshToken, redirectURI });
}

async function getMe(access_token) {
  return cloudAPICall("getMe", { access_token });
}

async function getAllPlaylists(user, access_token) {
  return cloudAPICall("getAllPlaylists", { user, access_token });
}

async function getPlaylist(playlist_id, access_token) {
  return cloudAPICall("getPlaylist", { playlist_id, access_token });
}

async function getAllSongsFromPlaylist(playlist_id, access_token) {
  return cloudAPICall("getAllSongsFromPlaylist", { playlist_id, access_token });
}

async function deleteSongsFromPlaylist(playlist_id, access_token, tracks) {
  return cloudAPICall("deleteSongsFromPlaylist", { playlist_id, access_token, tracks });
}

async function unfollowPlaylist(playlist_id, access_token) {
  return cloudAPICall("unfollowPlaylist", { playlist_id, access_token });
}

// export async function _unfollowPlaylist(playlist_id, access_token) {
//   const opts = {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + access_token,
//     },
//   };

//   const response = await fetch(`${apiURI}/playlists/${playlist_id}/followers`, opts);

//   return response;
// }

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

export const spotifyService = {
  getAccessToken,
  getRefreshedAccessToken,
  getMe,
  getAllPlaylists,
  getPlaylist,
  getAllSongsFromPlaylist,
  deleteSongsFromPlaylist,
  unfollowPlaylist,
};
