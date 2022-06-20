// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { reducer as user } from './user';
import { reducer as widget } from './widget';

const reducer = combineReducers({
    user,
    widget,
});

const store = configureStore({
    reducer,
});

export default store;
