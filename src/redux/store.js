// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { reducer as user } from './user';
import { reducer as spotify } from "./spotify"

const reducer = combineReducers({
    user,
    spotify
});

const store = configureStore({
  reducer,
  devTools: true,
});

export default store;
