import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firebaseClient from "firebase/client";

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
      state.existsInDb = true;
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

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  createDataFailure,
  appendData,
  appendDataSuccess,
  appendDataFailure,
} = user.actions;

export const fetchUser = createAsyncThunk("user/fetchUser", async (payload, thunkAPI) => {
  thunkAPI.dispatch(appendData());

  try {
    const data = await _fetchUserFromDb(payload.uid);
    
    if (!data) {
      thunkAPI.dispatch(createUserData(payload));
    } else {
      thunkAPI.dispatch(appendDataSuccess({...payload, ...data}));
    }
  } catch (error) {
    thunkAPI.dispatch(appendDataFailure(error));
  }
});

export const createUserData = createAsyncThunk(
  "user/createUserData",
  async (payload, thunkAPI) => {
    try {
      const response = await _createUserData(payload.uid);
      thunkAPI.dispatch(fetchUser(payload));
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error));
    }
  }
);

async function _fetchUserFromDb(uid) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("users")
    .where("uid", "==", uid)
    .get();

  const data = snapshot.docs[0] ? { ...snapshot.docs[0].data() } : null;

  return data;
}

async function _createUserData(uid) {
  const doc = await firebaseClient
    .firestore()
    .collection("users")
    .add({ uid, access_token: null, refresh_token: null });

  return doc;
}
