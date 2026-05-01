import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, changeOrderStatus } from 'services/orders.service';
import { getPage } from 'utils/common';

// Async thunk for fetching orders list
export const fetchOrdersList = createAsyncThunk(
  'orders/fetchOrdersList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch orders');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing order status
export const changeOrderStatusAction = createAsyncThunk(
  'orders/changeOrderStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { order_id, status } = payload;
      const option = {
        order_id: parseInt(order_id),
        status: status,
      };
      const res = await changeOrderStatus(option);
      if (res.status === true) {
        return { order_id, status, message: 'Order status changed successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to change order status');
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

const orderSlice = createSlice({
  name: 'orders',
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
    resetOrderState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders list
    builder
      .addCase(fetchOrdersList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchOrdersList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchOrdersList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change order status
    builder
      .addCase(changeOrderStatusAction.pending, (state) => {
        state.error = null;
      })
      .addCase(changeOrderStatusAction.fulfilled, (state, action) => {
        // Update the order status in the list
        const orderIndex = state.listData.findIndex(
          (order) => order.id === action.payload.order_id
        );
        if (orderIndex !== -1) {
          state.listData[orderIndex].order_status = action.payload.status;
        }
      })
      .addCase(changeOrderStatusAction.rejected, (state, action) => {
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
  resetOrderState,
} = orderSlice.actions;

export default orderSlice.reducer;

