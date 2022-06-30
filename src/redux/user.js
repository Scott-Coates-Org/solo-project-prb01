// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  existsInDb: false,
  errorMsg: {},
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    getData: (state) => {},

    getDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = action.payload;
    },

    getDataFailure: (state, action) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    createDataFailure: (state, action) => {
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    appendData: (state) => {
      state.isLoaded = false;
      state.hasErrors = false;
      state.errorMsg = {};
    },
    appendDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = { ...state.data, ...action.payload };
    },
    appendDataFailure: (state, action) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
  },
});

export const reducer = user.reducer;

export const { getData, getDataSuccess, getDataFailure } = user.actions;

export const fetchUser = createAsyncThunk(
  "user/fetchUser", 
  async (payload, thunkAPI) => {
  thunkAPI.dispatch(appendData());

  try {
    const data = await _fetchUserFromDb(payload.uid);
    thunkAPI.dispatch(appendDataSuccess(data));
  } catch (error) {
    thunkAPI.dispatch(appendDataFailure(error));
  }
});

export const createUserData = createAsyncThunk(
  "user/createUserData",
  async (payload, thunkAPI) => {
    try {
      await _createUserData(payload.uid);
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error));
    }
  }
);

async function _fetchUserFromDb(uid) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("users")
    .where("uid", "==", uid);

  const data = snapshot.docs.map((doc) => ({ ...doc.data() }));

  return data;
}

async function _createUserData(uid) {
  const doc = await firebaseClient
    .firestore()
    .collection("users")
    .add({ uid, access_token: null, refresh_token: null });

  return doc;
}
