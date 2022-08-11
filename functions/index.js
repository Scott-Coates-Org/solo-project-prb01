const axios = require("axios").default;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const apiURI = "https://api.spotify.com/v1";
const redirectURI = `https://spotlist.prb01.com/dashboard`;

// Common error to check that user is logged in to run function
const checkUserLoggedIn = (context) => {
  if (!context.auth && context.resource.service !== "pubsub.googleapis.com") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  } else return true;
};

// Check user is logged in and an admin to run
const checkUserIsAdmin = async (context) => {
  const user = await _fetchUserFromDb(context.auth.uid);

  if (!user.admin) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This function is only available to admins."
    );
  } else return true;
};

// ----------------------------------------------------------------------
// START -- SPOTIFY API CALLS & HELPER FUNCTIONS --

// Helper call to handle errors
const spotifyAPICalls = async (context, opts) => {
  if (checkUserLoggedIn(context)) {
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
        throw new functions.https.HttpsError(error.status, error.message);
      }
    }
  }
};

// Get Spotify access token
const _getAccessToken = (data, context) => {
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
    throw new functions.https.HttpsError(
      "invalid-argument",
      "States are not the same"
    );
  }

  return spotifyAPICalls(context, opts);
};

exports.getAccessToken = functions.https.onCall(async (data, context) => {
  return await _getAccessToken(data, context);
});

// Get refreshed access token
const _getRefreshedAccessToken = (data, context) => {
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
};

exports.getRefreshedAccessToken = functions.https.onCall(async (data, context) => {
  return await _getRefreshedAccessToken(data, context);
});

// Get Spotify Me
const _getMe = (data, context) => {
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
};

exports.getMe = functions.https.onCall(async (data, context) => {
  return await _getMe(data, context);
});

// Get all playlists
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

const _getAllPlaylists = async (data, context) => {
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
};

exports.getAllPlaylists = functions.https.onCall(async (data, context) => {
  return await _getAllPlaylists(data, context);
});

// Get one playlist
const _getPlaylist = (data, context) => {
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
};

exports.getPlaylist = functions.https.onCall(async (data, context) => {
  return await _getPlaylist(data, context);
});

// Get songs from playlist
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

const _getAllSongsFromPlaylist = async (data, context) => {
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
};

exports.getAllSongsFromPlaylist = functions.https.onCall(async (data, context) => {
  return await _getAllSongsFromPlaylist(data, context);
});

// API call to delete songs from playlist
// Can only delete 100 at a time
// Tracks are in array json format: {"tracks": [{ "uri": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh" },{ "uri": "spotify:track:1301WleyT98MSxVHPZCA6M" }] }
const _deleteSongsFromPlaylist = (data, context) => {
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
};

exports.deleteSongsFromPlaylist = functions.https.onCall(async (data, context) => {
  return await _deleteSongsFromPlaylist(data, context);
});

// Delete (unfollow) a playlist
const _unfollowPlaylist = (data, context) => {
  const { playlist_id, access_token } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/followers`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

exports.unfollowPlaylist = functions.https.onCall(async (data, context) => {
  return await _unfollowPlaylist(data, context);
});

// API call to create a new playlist for a specific user id
const _createPlaylist = (data, context) => {
  const { user_id, access_token, name, description } = data;
  const payload = {
    name,
    description,
  };
  const opts = {
    url: `${apiURI}/users/${user_id}/playlists`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(payload),
  };

  return spotifyAPICalls(context, opts);
};

exports.createPlaylist = functions.https.onCall(async (data, context) => {
  return await _createPlaylist(data, context);
});

// API call to add tracks to a playlist
// Can only add 100 tracks at a time
// Tracks are an array of spotify track uris {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M",
const _addSongsToPlaylist = (data, context) => {
  const { playlist_id, access_token, uris } = data;
  const payload = {
    uris,
  };
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/tracks`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(payload),
  };

  return spotifyAPICalls(context, opts);
};

exports.addSongsToPlaylist = functions.https.onCall(async (data, context) => {
  return await _addSongsToPlaylist(data, context);
});

//END   -- SPOTIFY API CALLS & HELPER FUNCTIONS --
//----------------------------------------------------------------------

//------------------------------------------------
//START -- UTILS --
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const retry = (maxRetries, fn, sleepTime = 5000) => {
  return fn().catch(async (error) => {
    if (maxRetries <= 0) {
      console.log(error.message);
      throw new functions.https.HttpsError("unknown", error.message);
    }

    console.error("**ERROR**", error.message, JSON.stringify(error));
    console.log(`*******waiting ${sleepTime / 1000}s before retrying*******`);
    await sleep(sleepTime);

    return retry(maxRetries - 1, fn, sleepTime);
  });
};

const _fetchAllCombinedPlaylistsFromDb = async () => {
  const snapshot = await admin.firestore().collection("combined_playlists").get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return data;
};

const _fetchUserFromDb = async (uid) => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .where("uid", "==", uid)
    .get();
  const data = snapshot.docs[0] ? { ...snapshot.docs[0].data() } : null;
  return data;
};

const _adminRefreshAllCombinedPlaylists = async (context, combo) => {
  // number of times to retry API call if it fails
  const retries = 5;

  // pull user info
  let user = await _fetchUserFromDb(combo.uid);

  console.log(`REFRESHING ${combo.name} for ${user.uid}`);

  // refresh token
  user = await retry(retries, () =>
    _getRefreshedAccessToken(
      {
        refreshToken: user.refresh_token,
        redirectURI: redirectURI,
      },
      context
    )
  );

  //   check playlist still exists, else next
  const playlist = await retry(retries, () =>
    _getPlaylist(
      {
        playlist_id: combo.id,
        access_token: user.access_token,
      },
      context
    )
  );

  if (!playlist) return;

  // get all songs in combined playlist
  const tracks = await retry(retries, () =>
    _getAllSongsFromPlaylist(
      {
        playlist_id: combo.id,
        access_token: user.access_token,
      },
      context
    )
  );
  const tracksURI = tracks.map((track) => ({
    uri: track.track.uri,
  }));

  // remove all songs in combined playlist
  console.log(`REMOVING ${tracksURI.length} tracks in ${combo.name}`);
  while (tracksURI.length > 0) {
    const deleteResponse = await retry(retries, () =>
      _deleteSongsFromPlaylist(
        {
          playlist_id: combo.id,
          access_token: user.access_token,
          tracks: {
            tracks: tracksURI.slice(0, 100),
          },
        },
        context
      )
    );

    // only remove tracks if delete was successful
    tracksURI.splice(0, 100);
  }

  // loop through playlists
  const tracksToAdd = [];
  for (const playlist of combo.playlists) {
    // get all songs from playlist, add to array
    const tracks = await retry(retries, () =>
      _getAllSongsFromPlaylist(
        {
          playlist_id: playlist.id,
          access_token: user.access_token,
        },
        context
      )
    );

    const tracksNotLocal = tracks
      .filter((track) => !track.track.is_local)
      .map((track) => track.track.uri);
    tracksToAdd.push(...tracksNotLocal);

    console.log(`BUFFERING ${tracksNotLocal.length} from ${playlist.name}`);
  }

  // remove duplicates?

  // add all songs to combined playlist
  console.log(`ADDING ${tracksToAdd.length} tracks to ${combo.name}`);
  while (tracksToAdd.length > 0) {
    const addResponse = await retry(retries, () =>
      _addSongsToPlaylist(
        {
          playlist_id: combo.id,
          access_token: user.access_token,
          uris: tracksToAdd.slice(0, 100),
        },
        context
      )
    );

    // only remove from tracksToAdd if add was successful
    tracksToAdd.splice(0, 100);
  }
  console.log(`DONE combining for ${combo.name}`);
  console.log(`**********************************************************`);

  return true;
};

exports.adminRefreshAllCombinedPlaylists = functions
  .runWith({ timeoutSeconds: 540 })
  .https.onCall(async (data, context) => {
    if (await checkUserIsAdmin(context)) {
      // fetch all combined playlists
      const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDb();

      console.log(`BEGIN REFRESH FOR ${combinedPlaylists.length} combos`);
      for (const combo of combinedPlaylists) {
        retry(3, () => _adminRefreshAllCombinedPlaylists(context, combo), 10000);
        await sleep(250);
      }

      return "Admin synch is running";
    }
  });

exports.scheduledAdminRefreshAllCombinedPlaylists = functions
  .runWith({ timeoutSeconds: 540 })
  .pubsub.schedule("every 6 hours")
  .onRun(async (context) => {
    console.log("*** Scheduled run of Admin Refresh all ***");

    // fetch all combined playlists
    const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDb();

    console.log(`BEGIN REFRESH FOR ${combinedPlaylists.length} combos`);
    for (const combo of combinedPlaylists) {
      retry(3, () => _adminRefreshAllCombinedPlaylists(context, combo), 10000);
      await sleep(250);
    }

    return "Scheduled synch is running";
  });

//END   -- UTILS --
//----------------------------------------------------------------------
