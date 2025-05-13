import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filteredProducts: [],
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    FILTER_BY_SEARCH(state, action) {
      const { products, search } = action.payload;
      const tempProducts = products.filter(
        (product) =>
         product.name.toLowerCase().includes(search.toLowerCase()) ||
         product.category.toLowerCase().includes(search.toLowerCase())
      );
      state.filteredProducts = tempProducts;
    },
    FILTER_BY_CATEGORY(state, action) {
      const { products, category } = action.payload;
      let tempProducts = [];
      if (category === "All") {
        tempProducts = products;
      } else {
        tempProducts = products.filter(
          (product) => product.category === category
        );
      }
      state.filteredProducts = tempProducts;
    },
    SORT_PRODUCTS(state, action) {
      const { products, sort } = action.payload;
      let tempProducts = [];
      switch (sort) {
        case "latest": {
          tempProducts = products;
          break;
        }
        case "a-z": {
          tempProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
          break;
        }
        case "z-a": {
          tempProducts = [...products].sort((a, b) => b.name.localeCompare(a.name));
          break;
        }
        case "lowest-price": {
          tempProducts = [...products].sort((a, b) => a.price - b.price);
          break;
        }
        case "highest-price": {
          tempProducts = [...products].sort((a, b) => b.price - a.price);
          break;
        }
      }
      state.filteredProducts = tempProducts;
    },
  },
});

export const { FILTER_BY_SEARCH, SORT_PRODUCTS,FILTER_BY_CATEGORY } = filterSlice.actions;
export const selectedFilterProducts = (state) => state.filter.filteredProducts;
export default filterSlice.reducer;
