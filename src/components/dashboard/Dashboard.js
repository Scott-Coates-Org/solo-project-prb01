import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSpotifyAuth, fetchSpotifyMe, fetchSpotifyPlaylists } from "redux/spotify";
import Nav from "components/nav/Nav";
import { useSearchParams } from "react-router-dom";

const Dashboard = (props) => {
  const dispatch = useDispatch();
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
  const baseURI = "https://accounts.spotify.com";
  const redirectURI = `${window.location.origin}/dashboard`;
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const {
    data: spotifyData,
    isLoaded: spotifyIsLoaded,
    hasErrors: spotifyHasErrors,
  } = useSelector((state) => state.spotify);
  const {
    data: userData,
    isLoaded: userIsLoaded,
    hasErrors: userHasErrors,
  } = useSelector((state) => state.user);

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

  const handleSetAccessToken = async () => {
    dispatch(createSpotifyAuth({ code, state, redirectURI }));
  };

  // const handleRefreshAccessToken = async () => {
  //   const response = await getRefreshedAccessToken(data.refresh_token);
  //   setSpotifyAuth(response);
  // };

  const handleGetMe = async () => {
    dispatch(fetchSpotifyMe({ access_token: spotifyData.access_token }));
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
      <div>
        <button onClick={handleSpotifyLogin}>Spotify Auth</button>
        <button onClick={handleSetAccessToken}>Spotify Set Access Token</button>
        {/* <button onClick={handleRefreshAccessToken}>Spotify Refresh Access Token</button> */}
        <button onClick={handleGetMe}>Spotify Get Me</button>
        <button onClick={handleGetPlaylists}>Spotify Get Playlists</button>
      </div>
      <div className="text-text">{JSON.stringify(spotifyData.user)}</div>
      <div className="text-text">{JSON.stringify(spotifyData.playlists)}</div>
    </div>
  );
};

export default Dashboard;
