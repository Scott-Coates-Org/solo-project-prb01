import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpotifyMe, fetchSpotifyPlaylists } from "redux/spotify";
import Nav from "components/nav/Nav";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addSpotifyAuth, updateSpotifyAuth } from "redux/user";

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
      console.log("IN HERE");
      dispatch(
        updateSpotifyAuth({
          uid: userData.uid,
          refresh_token: userData.refresh_token,
          redirectURI,
        })
      );
      navigate("/dashboard");
    }
  }, [userIsLoaded]);

  const handleSetAccessToken = async () => {
    dispatch(createSpotifyAuth({ code, state, redirectURI }));
  };

  // const handleRefreshAccessToken = async () => {
  //   const response = await getRefreshedAccessToken(data.refresh_token);
  //   setSpotifyAuth(response);
  // };

  const handleGetMe = async () => {
    dispatch(fetchSpotifyMe({ access_token: userData.access_token }));
  };

  const handleGetPlaylists = async () => {
    dispatch(
      fetchSpotifyPlaylists({
        user: spotifyData.user.id,
        access_token: spotifyData.access_token,
      })
    );
  };

  return (
    <div className="vh-100 vw-100 d-flex flex-column justify-content-center align-items-center homepage-bg p-2">
      <Nav />
      {!userIsLoaded && "User data loading..."}
      {userHasErrors && "Error Loading user data..."}
      {userIsLoaded && (
        <div>
          {!userData.access_token && (
            <button onClick={handleSpotifyLogin}>Spotify Auth</button>
          )}
          <button onClick={handleSetAccessToken}>Spotify Set Access Token</button>
          {/* <button onClick={handleRefreshAccessToken}>Spotify Refresh Access Token</button> */}
          <button onClick={handleGetMe}>Spotify Get Me</button>
          <button onClick={handleGetPlaylists}>Spotify Get Playlists</button>
        </div>
      )}
      <div className="text-text">{JSON.stringify(spotifyData.user)}</div>
      <div className="text-text">{JSON.stringify(spotifyData.playlists)}</div>
    </div>
  );
};

export default Dashboard;
