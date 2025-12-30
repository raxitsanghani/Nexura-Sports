import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartState {
  items: Record<string, CartItem>;
  isOpen: boolean;
}

const initialState: CartState = {
  items: {},
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
        color?: string;
        size?: string;
      }>
    ) {
      const { productId, quantity, color, size } = action.payload;
      if (quantity < 1) return;

      if (state.items[productId]) {
        state.items[productId].quantity += quantity;
        state.items[productId].color = color ?? state.items[productId].color;
        state.items[productId].size = size ?? state.items[productId].size;
      } else {
        state.items[productId] = { productId, quantity, color, size };
      }
      state.isOpen = true; // Open cart on add
    },
    removeFromCart(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const { productId, quantity } = action.payload;
      if (quantity < 1) {
        delete state.items[productId];
      } else if (state.items[productId]) {
        state.items[productId].quantity = quantity;
      }
    },
    clearCart(state) {
      state.items = {};
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
  },
});

// Selector to get the total number of items in the cart
export const selectTotalCartItems = (state: { cart: CartState }): number => {
  return Object.values(state.cart.items).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
};

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart } =
  cartSlice.actions;
export default cartSlice.reducer;
