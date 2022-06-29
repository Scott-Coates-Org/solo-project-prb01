import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { createSpotifyAuth } from "redux/spotify";
import Nav from "components/nav/Nav";

const Dashboard = (props) => {
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
  const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
  const baseURI = "https://accounts.spotify.com";
  const apiURI = "https://api.spotify.com/v1";
  const redirectURI = `${window.location.origin}/dashboard`;
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const dispatch = useDispatch();
  const { data, isLoaded, hasErrors } = useSelector((state) => state.spotify);
  const [me, setMe] = useState();
  const [playlists, setPlaylists] = useState();

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

  const getAccessToken = async () => {
    if (state !== spotifyState) {
      return console.log("States are not the same");
    }

    const formBody = new URLSearchParams();
    formBody.set("grant_type", "authorization_code");
    formBody.set("code", code);
    formBody.set("redirect_uri", redirectURI);

    const response = await fetch(`${baseURI}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + new Buffer(clientId + ":" + clientSecret).toString("base64"),
      },
      body: formBody,
    });

    return response.json();
  };

  const setSpotifyAuth = async (spotifyAuth) => {
    console.log(spotifyAuth);
    dispatch(createSpotifyAuth(spotifyAuth));
  };

  const getRefreshedAccessToken = async (refreshToken) => {
    const formBody = new URLSearchParams();
    formBody.set("grant_type", "refresh_token");
    formBody.set("refresh_token", refreshToken);
    formBody.set("redirect_uri", redirectURI);

    const response = await fetch(`${baseURI}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + new Buffer(clientId + ":" + clientSecret).toString("base64"),
      },
      body: formBody,
    });

    return response.json();
  };

  const getMe = async () => {
    const response = await fetch(`${apiURI}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + data.access_token,
      },
    });

    return response.json();
  };

  const getPlaylists = async () => {
    const response = await fetch(`${apiURI}/users/${data.spotifyId}/playlists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + data.access_token,
      },
    });

    return response.json();
  };

  const handleSetAccessToken = async () => {
    const response = await getAccessToken();
    setSpotifyAuth(response);
  };

  const handleRefreshAccessToken = async () => {
    const response = await getRefreshedAccessToken(data.refresh_token);
    setSpotifyAuth(response);
  };

  const handleGetMe = async () => {
    const response = await getMe();
    setMe(response);
  };

  const handleSetMe = async () => {
    const response = await getMe();
    setSpotifyAuth({ spotifyId: response.id });
  };

  const handleGetPlaylists = async () => {
    const response = await getPlaylists();
    setPlaylists(response);
  };

  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center homepage-bg p-2">
      <Nav />
      <div>
        <button onClick={handleSpotifyLogin}>Spotify Auth</button>
        <button onClick={handleSetAccessToken}>Spotify Set Access Token</button>
        <button onClick={handleRefreshAccessToken}>Spotify Refresh Access Token</button>
        <button onClick={handleGetMe}>Spotify Get Me</button>
        <button onClick={handleSetMe}>Spotify Set Me</button>
        <button onClick={handleGetPlaylists}>Spotify Get Playlists</button>
      </div>
      <div>{JSON.stringify(me)}</div>
      <div>{JSON.stringify(playlists)}</div>
    </div>
  );
};

export default Dashboard;
