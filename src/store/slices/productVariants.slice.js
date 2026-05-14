import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, productVariantChangeStatus } from 'services/productVariant.service';
import { getPage } from 'utils/common';

// Async thunk for fetching product variants list
export const fetchProductVariantsList = createAsyncThunk(
  'productVariants/fetchProductVariantsList',
  async (options, { rejectWithValue }) => {
    try {
      const listData = await list(options);
      if (listData.status === true) {
        return {
          data: listData?.result || [],
          count: listData?.count || 0,
          totalPages: getPage(listData?.count || 1, options?.limit || 10),
        };
      } else {
        return rejectWithValue(listData?.message || 'Failed to fetch product variants');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing product variant status
export const changeProductVariantStatus = createAsyncThunk(
  'productVariants/changeProductVariantStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await productVariantChangeStatus(option);
      if (res.status === true) {
        return { id: parseInt(editId), status, message: 'Status changed successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to change status');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Operation not perform yet! please try in some time.');
    }
  }
);

const initialState = {
  listData: [],
  isLoading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  skip: 0,
  count: 0,
  filter: {
    from: '',
    to: '',
    filter_by: '',
    search: '',
  },
  showRequest: '',
};

const productVariantSlice = createSlice({
  name: 'productVariants',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
      state.skip = (action.payload - 1) * state.limit;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.skip = 0;
      state.currentPage = 1;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
      state.skip = 0;
      state.currentPage = 1;
    },
    resetFilter: (state) => {
      state.filter = {
        from: '',
        to: '',
        filter_by: '',
        search: '',
      };
      state.skip = 0;
      state.currentPage = 1;
    },
    setShowRequest: (state, action) => {
      state.showRequest = action.payload;
      state.skip = 0;
      state.currentPage = 1;
    },
    resetProductVariantState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch product variants list
    builder
      .addCase(fetchProductVariantsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchProductVariantsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchProductVariantsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change product variant status
    builder
      .addCase(changeProductVariantStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeProductVariantStatus.fulfilled, (state, action) => {
        // Update the product variant status in the list
        const variantIndex = state.listData.findIndex(
          (variant) => variant.id === action.payload.id
        );
        if (variantIndex !== -1) {
          state.listData[variantIndex].status = action.payload.status;
        }
      })
      .addCase(changeProductVariantStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  setLimit,
  setFilter,
  resetFilter,
  setShowRequest,
  resetProductVariantState,
} = productVariantSlice.actions;

export default productVariantSlice.reducer;

