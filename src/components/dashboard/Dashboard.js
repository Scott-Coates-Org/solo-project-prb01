import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import Nav from "components/nav/Nav";
import CreateComboPlaylist from "components/playlists/CreateComboPlaylist";
import ListOfComboPlaylists from "components/playlists/ListOfComboPlaylists";
import {
  adminRefreshAllCombinedPlaylists,
  getDifferenceInMins,
  spotifyLogin,
} from "utils/utils";
import { addSpotifyAuth, updateSpotifyAuth, _fetchUserFromDb } from "redux/user";
import {
  _fetchAllCombinedPlaylistsFromDb,
  fetchSpotifyMe,
  fetchSpotifyPlaylists,
  fetchCombinedPlaylistsByUid,
} from "redux/spotify";
import {
  _addSongsToPlaylist,
  _deleteSongsFromPlaylist,
  _getAllSongsFromPlaylist,
  _getPlaylist,
  _getRefreshedAccessToken,
} from "components/services/spotifyService";
import RefreshOverlay from "./RefreshOverlay";

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
  const [timeoutId, setTimeoutId] = useState();
  const [refreshRequired, setRefreshRequired] = useState(false);
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

  const handleConnectSpotify = () => {
    spotifyLogin();
  };

  useEffect(() => {
    // if no userData, then return
    if (!userIsLoaded) return;

    // trigger if spotify has been authorized (code & state comes from Spotify)
    if (code && state) {
      dispatch(addSpotifyAuth({ uid: userData.uid, code, state, redirectURI }));
      navigate("/dashboard");
      return;
    }

    // Access token needs to be refreshed every 60mins, so check last time it was updated
    const lastUpdateInMins = getDifferenceInMins(new Date(userData.updatedAt), new Date());

    // If updated over 60mins ago, then trigger a token refresh
    if (userData.access_token && lastUpdateInMins > 60) {
      dispatch(
        updateSpotifyAuth({
          uid: userData.uid,
          refresh_token: userData.refresh_token,
          redirectURI,
        })
      );
      setRefreshRequired(false);
      navigate("/dashboard");
      return;
    }

    // if updated less than 60mins ago, put in a setTimeout call to ask user to refresh token
    if (userData.access_token && lastUpdateInMins < 60) {
      if (timeoutId) clearTimeout(timeoutId);

      const timeToWaitInMs = (60 - lastUpdateInMins) * 60 * 1000;

      const id = setTimeout(() => {
        setRefreshRequired(true);
        setTimeoutId();
        return;
      }, timeToWaitInMs);

      setTimeoutId(id);
    }

    // This should be triggered if access token exists & has been alive for less than 60mins
    // If true, then get Spotify details for user & fetch their Spotify playlists
    if (userData.access_token) {
      dispatch(fetchSpotifyMe({ access_token: userData.access_token })).then((data) => {
        dispatch(
          fetchSpotifyPlaylists({
            user: data.payload,
            access_token: userData.access_token,
          })
        );

        // fetch their combined Playlists as well from DB
        dispatch(fetchCombinedPlaylistsByUid({ uid: userData.uid }));
      });
    }
  }, [userIsLoaded, userData]);

  const handleRefreshToken = () => {
    dispatch(
      updateSpotifyAuth({
        uid: userData.uid,
        refresh_token: userData.refresh_token,
        redirectURI,
      })
    );
    setRefreshRequired(false);
    navigate("/dashboard");
  };

  return (
    <div className="vw-100 min-vh-100 h-100 d-flex flex-column align-items-center homepage-bg p-2 pt-5 text-text">
      <Nav />
      {!userIsLoaded && (
        <Spinner color="secondary" className="position-absolute top-50 start-50">
          Loading...
        </Spinner>
      )}
      {userHasErrors && "Error Loading user data..."}
      {userIsLoaded && !userHasErrors && !userData.access_token && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column justify-content-center align-items-center overflow-hidden">
          <h1 className="text-text mb-3">Connect your Spotify Account to start</h1>
          <div className="d-flex justify-content-center">
            <Button
              color="secondary"
              className="btn-rounded d-flex gap-2 align-items-center fs-4 text-primary"
              onClick={handleConnectSpotify}
            >
              <FontAwesomeIcon icon={faSpotify} />
              Connect Spotify
            </Button>
          </div>
        </div>
      )}
      {userIsLoaded && !userHasErrors && userData.access_token && (
        <>
          {refreshRequired && <RefreshOverlay handleRefreshToken={handleRefreshToken} />}
          <div>
            {!spotifyIsLoaded &&
              !spotifyData.playlists && !spotifyData.user && !spotifyData.combinedPlaylists && (
                <Spinner color="secondary" className="position-absolute top-50 start-50">
                  Loading...
                </Spinner>
              )}
            {spotifyHasErrors && `Error Loading: ${spotifyErrorMsg}`}
            {spotifyIsLoaded && spotifyData.playlists && <CreateComboPlaylist />}

            {spotifyIsLoaded && spotifyData.combinedPlaylists && (
              <ListOfComboPlaylists combinedPlaylists={spotifyData.combinedPlaylists} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
