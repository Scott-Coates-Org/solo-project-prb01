import { _fetchAllCombinedPlaylistsFromDb } from "redux/spotify";
import { _fetchUserFromDb } from "redux/user";
import {
  _getRefreshedAccessToken,
  _getPlaylist,
  _getAllSongsFromPlaylist,
  _deleteSongsFromPlaylist,
  _addSongsToPlaylist,
} from "components/services/spotifyService";

// VARIABLES
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const redirectURI = `${window.location.origin}/dashboard`;

// UTILS
export const spotifyLogin = () => {
  try {
    const scope = [
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-read-private",
      "playlist-modify-private",
    ].join(" ");

    window.location.replace(
      `${baseURI}/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectURI}&state=${spotifyState}`
    );
  } catch (error) {
    console.log(error);
  }
};

export const adminRefreshAllCombinedPlaylists = async () => {
  try {
    // fetch all combined playlists
    const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDb();

    // loop through combined playlists
    for (const combo of combinedPlaylists) {
      // pull user info
      let user = await _fetchUserFromDb(combo.uid);

      console.log(`REFRESHING ${combo.name} for ${user.uid}`);

      // refresh token
      userResponse = await _getRefreshedAccessToken(user.refresh_token, redirectURI);

      if (userResponse.status !== 200) {
        const errorMsg = await userResponse.text();
        throw { message: errorMsg };
      }

      user = await userResponse.json();

      //   check playlist still exists, else next
      const playlistResponse = await _getPlaylist(combo.id, user.access_token);

      if (playlistResponse.status !== 200) {
        const errorMsg = await playlistResponse.text();
        throw { message: errorMsg };
      }

      const playlistExists = await playlistResponse.json();
      if (!playlistExists) continue;

      // get all songs in combined playlist
      const tracks = await _getAllSongsFromPlaylist(combo.id, user.access_token);
      const tracksURI = tracks.map((track) => ({
        uri: track.track.uri,
      }));

      // remove all songs in combined playlist
      console.log(`REMOVING ${tracksURI.length} tracks in CombinedPlaylist`);
      while (tracksURI.length > 0) {
        const deleteResponse = await _deleteSongsFromPlaylist(combo.id, user.access_token, {
          tracks: tracksURI.splice(0, 100),
        });

        if (deleteResponse.status !== 200) {
          const errorMsg = await deleteResponse.text();
          throw { message: errorMsg };
        }
      }

      // loop through playlists
      const tracksToAdd = [];
      for (const playlist of combo.playlists) {
        // get all songs from playlist, add to array
        const tracks = await _getAllSongsFromPlaylist(playlist.id, user.access_token);
        tracksToAdd.push(
          ...tracks.filter((track) => !track.track.is_local).map((track) => track.track.uri)
        );

        console.log(`BUFFERING ${tracks.length} from ${playlist.name}`);
      }

      // remove duplicates?

      // add all songs to combined playlist
      console.log(`ADDING ${tracksToAdd.length} tracks to Combined Playlist`);
      while (tracksToAdd.length > 0) {
        const addResponse = await _addSongsToPlaylist(
          combo.id,
          user.access_token,
          tracksToAdd.splice(0, 100)
        );

        if (addResponse.status !== 200) {
          const errorMsg = await addResponse.text();
          throw { message: errorMsg };
        }
      }
      console.log(`DONE combining for ${combo.name}`);
    }
  } catch (error) {
    alert(error.message);
  }
};

export const refreshNewCombinedPlaylist = async (combo, access_token) => {
  try {
    //   check playlist still exists, else return
    const playlistResponse = await _getPlaylist(combo.id, access_token);

    if (playlistResponse.status !== 200) {
      const errorMsg = await playlistResponse.text();
      throw { message: errorMsg };
    }

    const playlistExists = await playlistResponse.json();
    if (!playlistExists) throw "Combined playlist does not exist";

    // loop through playlists
    const tracksToAdd = [];
    for (const playlist of combo.playlists) {
      // get all songs from playlist, add to array
      const tracks = await _getAllSongsFromPlaylist(playlist.id, access_token);
      tracksToAdd.push(
        ...tracks.filter((track) => !track.track.is_local).map((track) => track.track.uri)
      );

      console.log(`BUFFERING ${tracks.length} from ${playlist.name}`);
    }

    // add all songs to combined playlist
    console.log(`ADDING ${tracksToAdd.length} tracks to Combined Playlist`);
    while (tracksToAdd.length > 0) {
      const addResponse = await _addSongsToPlaylist(
        combo.id,
        access_token,
        tracksToAdd.splice(0, 100)
      );

      if (addResponse.status !== 200) {
        const errorMsg = await addResponse.text();
        throw { message: errorMsg };
      }
    }
    console.log(`DONE combining for ${combo.name}`);
  } catch (error) {
    console.log(error);
  }
};
