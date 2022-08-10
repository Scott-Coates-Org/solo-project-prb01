import { _fetchAllCombinedPlaylistsFromDb } from "redux/spotify";
import { _fetchUserFromDb } from "redux/user";
import { spotifyService } from "components/services/spotifyService";
import {
  _addSongsToPlaylist,
} from "components/services/spotifyService";

// VARIABLES
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const redirectURI = `${window.location.origin}/dashboard`;

// UTILS
export const getDifferenceInMins = (fromDate, toDate) => {
  const diff = Math.floor((toDate - fromDate) / (1000 * 60));
  console.log(diff);
  return diff;
};

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

    console.log(`BEGIN REFRESH FOR ${combinedPlaylists.length} combos`);

    // loop through combined playlists
    for (const combo of combinedPlaylists) {
      // pull user info
      let user = await _fetchUserFromDb(combo.uid);

      console.log(`REFRESHING ${combo.name} for ${user.uid}`);

      // refresh token
      user = await spotifyService.getRefreshedAccessToken(user.refresh_token, redirectURI);

      //   check playlist still exists, else next
      const playlist = await spotifyService.getPlaylist(combo.id, user.access_token);

      if (!playlist) continue;

      // get all songs in combined playlist
      const tracks = await spotifyService.getAllSongsFromPlaylist(combo.id, user.access_token);
      const tracksURI = tracks.map((track) => ({
        uri: track.track.uri,
      }));

      // remove all songs in combined playlist
      console.log(`REMOVING ${tracksURI.length} tracks in CombinedPlaylist`);
      while (tracksURI.length > 0) {
        const deleteResponse = await spotifyService.deleteSongsFromPlaylist(combo.id, user.access_token, {
          tracks: tracksURI.splice(0, 100),
        });

        // if (deleteResponse.status !== 200) {
        //   const errorMsg = await deleteResponse.text();
        //   throw { message: errorMsg };
        // }
      }

      // loop through playlists
      const tracksToAdd = [];
      for (const playlist of combo.playlists) {
        // get all songs from playlist, add to array
        const tracks = await spotifyService.getAllSongsFromPlaylist(playlist.id, user.access_token);
        const tracksNotLocal = tracks.filter((track) => !track.track.is_local).map((track) => track.track.uri)
        tracksToAdd.push(
          ...tracksNotLocal
        );

        console.log(`BUFFERING ${tracksNotLocal.length} from ${playlist.name}`);
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

        if (addResponse.status !== 201) {
          const errorMsg = await addResponse.text();
          throw { message: errorMsg };
        }
      }
      console.log(`DONE combining for ${combo.name}`);
    }

    console.log(`COMPLETED REFRESH FOR ${combinedPlaylists.length} combos`);
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
      const tracks = await spotifyService.getAllSongsFromPlaylist(playlist.id, access_token);
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

      if (addResponse.status !== 201) {
        const errorMsg = await addResponse.text();
        throw { message: errorMsg };
      }
    }
    console.log(`DONE combining for ${combo.name}`);
  } catch (error) {
    console.log(error.message);
  }
};
