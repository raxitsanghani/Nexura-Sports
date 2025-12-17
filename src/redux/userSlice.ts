import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Authentication
import { db } from "@/Database/firebase";

// Define the initial state
const initialState = {
  user: null,
  userId: null, // Add userId to state
  favorites: [], // Add favorites to state
  status: "idle",
  error: null,
};

// Define an async thunk to fetch user data from Firestore
export const fetchUser = createAsyncThunk("users/fetchUser", async (userId) => {
  // @ts-ignore
  const userDoc = doc(db, "users", userId);
  const docSnap = await getDoc(userDoc);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("No such document!");
  }
});

// Define an async thunk to check authentication state
export const checkAuthState = createAsyncThunk(
  "users/checkAuthState",
  async () => {
    const auth = getAuth();
    // @ts-ignore
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // @ts-ignore
          resolve(user.uid);
        } else {
          // @ts-ignore
          resolve(null);
        }
      });
    });
  }
);

// Define an async thunk to fetch favorite product IDs
export const fetchFavorites = createAsyncThunk(
  "users/fetchFavorites",
  async (userId) => {
    // @ts-ignore
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      return userData?.favorites || [];
    } else {
      throw new Error("No such document!");
    }
  }
);

// Create the users slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthState.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.status = "succeeded";
        // @ts-ignore
        state.userId = action.payload;
        if (action.payload) {
          // Fetch user data if user ID is available
          // @ts-ignore
          state.userId = action.payload;
        }
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.status = "failed";
        // @ts-ignore
        state.error = action.error.message;
      })
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        // @ts-ignore
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        // @ts-ignore
        state.error = action.error.message;
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.status = "failed";
        // @ts-ignore
        state.error = action.error.message;
      });
  },
});

export default usersSlice.reducer;
