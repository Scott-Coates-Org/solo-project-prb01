import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  _fetchAllCombinedPlaylistsFromDb,
  fetchSpotifyMe,
  fetchSpotifyPlaylists,
} from "redux/spotify";
import Nav from "components/nav/Nav";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addSpotifyAuth, updateSpotifyAuth, _fetchUserFromDb } from "redux/user";
import CreateComboPlaylist from "components/playlists/CreateComboPlaylist";
import {
  _addSongsToPlaylist,
  _deleteSongsFromPlaylist,
  _getAllSongsFromPlaylist,
  _getPlaylist,
  _getRefreshedAccessToken,
} from "components/services/spotifyService";

const Dashboard = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
  const baseURI = "https://accounts.spotify.com";
  const redirectURI = `${window.location.origin}/dashboard`;
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const {
    data: userData,
    isLoaded: userIsLoaded,
    hasErrors: userHasErrors,
    errorMsg: userErrorMsg,
  } = useSelector((state) => state.user);
  const {
    data: spotifyData,
    isLoaded: spotifyIsLoaded,
    hasErrors: spotifyHasErrors,
    errorMsg: spotifyErrorMsg,
  } = useSelector((state) => state.spotify);

  const getDifferenceInMins = (fromDate, toDate) => {
    const diff = Math.floor((toDate - fromDate) / (1000 * 60));
    console.log(diff);
    return diff;
  };

  const handleSpotifyLogin = async () => {
    const scope = [
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-read-private",
      "playlist-modify-private",
    ].join(" ");

    window.location.replace(
      `${baseURI}/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectURI}&state=${spotifyState}`
    );
  };

  useEffect(() => {
    if (!userIsLoaded) return;

    if (userIsLoaded && !userData.access_token && code && state) {
      dispatch(addSpotifyAuth({ uid: userData.uid, code, state, redirectURI }));
      navigate("/dashboard");
    }

    const lastUpdateInMins = getDifferenceInMins(new Date(userData.updatedAt), new Date());

    if (userIsLoaded && userData.access_token && lastUpdateInMins > 60) {
      dispatch(
        updateSpotifyAuth({
          uid: userData.uid,
          refresh_token: userData.refresh_token,
          redirectURI,
        })
      );
      navigate("/dashboard");
    }

    if (userIsLoaded && userData.access_token) {
      dispatch(fetchSpotifyMe({ access_token: userData.access_token })).then((data) => {
        dispatch(
          fetchSpotifyPlaylists({
            user: data.payload,
            access_token: userData.access_token,
          })
        );
      });
    }
  }, [userIsLoaded, userData]);

  const handleSetAccessToken = async () => {
    dispatch(createSpotifyAuth({ code, state, redirectURI }));
  };

  const handleRefreshAccessToken = async () => {
    dispatch(
      updateSpotifyAuth({
        uid: userData.uid,
        refresh_token: userData.refresh_token,
        redirectURI,
      })
    );
  };

  const handleGetMe = async () => {
    dispatch(fetchSpotifyMe({ access_token: userData.access_token }));
  };

  const handleGetPlaylists = async () => {
    dispatch(
      fetchSpotifyPlaylists({
        user: spotifyData.user.id,
        access_token: userData.access_token,
      })
    );
  };

  const handleRefreshCombinedPlaylists = async () => {
    // fetch all combined playlists
    // loop through combined playlists
    // loop:
    //   pull user info
    //   refresh token
    //   check playlist still exists, else next
    //   get all songs in combined playlist
    //   remove all songs in combined playlist
    //   loop through playlists
    //   loop:
    //     get all songs from playlist, add to array
    //   remove duplicates?
    //   add all songs to combined playlist

    try {
      const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDb();

      for (const combo of combinedPlaylists) {
        let user = await _fetchUserFromDb(combo.uid);
        user = await _getRefreshedAccessToken(user.refresh_token, redirectURI);

        const check = await _getPlaylist(combo.id, user.access_token);
        if (!check) continue;

        const tracks = await _getAllSongsFromPlaylist(combo.id, user.access_token);
        const tracksURI = tracks.map((track) => ({
          uri: track.track.uri,
        }));

        while (tracksURI.length > 0) {
          await _deleteSongsFromPlaylist(combo.id, user.access_token, {
            tracks: tracksURI.splice(0, 100),
          });
        }

        const tracksToAdd = [];
        for (const playlist of combo.playlists) {
          const tracks = await _getAllSongsFromPlaylist(playlist, user.access_token);
          tracksToAdd.push(...tracks.map((track) => track.track.uri));
        }

        while (tracksToAdd.length > 0) {
          const response = await _addSongsToPlaylist(
            combo.id,
            user.access_token,
            tracksToAdd.splice(0, 100)
          );
        }
      }
    } 
    catch (error) {
      alert(error.message)
    }
  };

  return (
    <div className="vh-100 vw-100 d-flex flex-column align-items-center homepage-bg p-2 pt-5">
      <Nav />
      {!userIsLoaded && "User data loading..."}
      {userHasErrors && "Error Loading user data..."}
      {userIsLoaded && (
        <div>
          <CreateComboPlaylist />
          <div>
            {!userData.access_token && (
              <button onClick={handleSpotifyLogin}>Spotify Auth</button>
            )}
            {/* <button onClick={handleRefreshAccessToken}>Spotify Refresh Access Token</button>
            <button onClick={handleGetMe}>Spotify Get Me</button>
            <button onClick={handleGetPlaylists}>Spotify Get Playlists</button> */}
            {userData.admin && <button onClick={handleRefreshCombinedPlaylists}>Refresh All Playlists</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
