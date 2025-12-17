// app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "../userSlice";
import productsReducer from "../productSlice";
import cartReducer from "../cartSlice";
const store = configureStore({
  reducer: {
    users: usersReducer,
    products: productsReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action paths and state paths
        ignoredActions: ["products/fetchProducts/fulfilled"],
        ignoredPaths: ["products.products"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
