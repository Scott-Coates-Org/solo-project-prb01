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
const redirectURI = `${window.location.origin}/dashboard`;


// UTILS
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
      user = await _getRefreshedAccessToken(user.refresh_token, redirectURI);

      //   check playlist still exists, else next
      const playlistExists = await _getPlaylist(combo.id, user.access_token);
      if (!playlistExists) continue;

      // get all songs in combined playlist
      const tracks = await _getAllSongsFromPlaylist(combo.id, user.access_token);
      const tracksURI = tracks.map((track) => ({
        uri: track.track.uri,
      }));

      // remove all songs in combined playlist
      console.log(`REMOVING ${tracksURI.length} tracks in CombinedPlaylist`);
      while (tracksURI.length > 0) {
        await _deleteSongsFromPlaylist(combo.id, user.access_token, {
          tracks: tracksURI.splice(0, 100),
        });
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
        const response = await _addSongsToPlaylist(
          combo.id,
          user.access_token,
          tracksToAdd.splice(0, 100)
        );
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
    const playlistExists = await _getPlaylist(combo.id, access_token);
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
      const response = await _addSongsToPlaylist(
        combo.id,
        access_token,
        tracksToAdd.splice(0, 100)
      );
    }
    console.log(`DONE combining for ${combo.name}`);
  } catch (error) {
    console.log(error);
  }
};
