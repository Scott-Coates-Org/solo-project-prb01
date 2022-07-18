import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  _fetchAllCombinedPlaylistsFromDb,
  fetchSpotifyMe,
  fetchSpotifyPlaylists,
  fetchCombinedPlaylistsByUid,
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
import ListOfComboPlaylists from "components/playlists/ListOfComboPlaylists";
import { adminRefreshAllCombinedPlaylists, spotifyLogin } from "utils/utils";

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

  const handleSpotifyLogin = () => {
    spotifyLogin();
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

        dispatch(fetchCombinedPlaylistsByUid({ uid: userData.uid }));
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

  return (
    <div className="vh-100 vw-100 d-flex flex-column align-items-center homepage-bg p-2 pt-5">
      <Nav />
      {!userIsLoaded && "User data loading..."}
      {userHasErrors && "Error Loading user data..."}
      {userIsLoaded && (
        <div className="mt-5">
          <CreateComboPlaylist />

          {spotifyIsLoaded && (
            <ListOfComboPlaylists combinedPlaylists={spotifyData.combinedPlaylists} />
          )}
          <div>
            <button onClick={handleSpotifyLogin}>Spotify Auth</button>
            {!userData.access_token && (
              <button onClick={handleSpotifyLogin}>Spotify Auth</button>
            )}
            {/* <button onClick={handleRefreshAccessToken}>Spotify Refresh Access Token</button>
            <button onClick={handleGetMe}>Spotify Get Me</button>
            <button onClick={handleGetPlaylists}>Spotify Get Playlists</button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
