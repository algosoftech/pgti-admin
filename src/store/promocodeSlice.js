import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, promocodeChangeStatus } from '../controllers/V1/promocodeController';
import { getPage } from '../controllers/common';

// Async thunk for fetching promocodes list
export const fetchPromocodesList = createAsyncThunk(
  'promocodes/fetchPromocodesList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch promocodes');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing promocode status
export const changePromocodeStatus = createAsyncThunk(
  'promocodes/changePromocodeStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await promocodeChangeStatus(option);
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

const promocodeSlice = createSlice({
  name: 'promocodes',
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
    resetPromocodeState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch promocodes list
      .addCase(fetchPromocodesList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPromocodesList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPromocodesList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Change promocode status
      .addCase(changePromocodeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePromocodeStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.listData.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.listData[index].status = action.payload.status;
        }
      })
      .addCase(changePromocodeStatus.rejected, (state, action) => {
        state.isLoading = false;
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
  resetPromocodeState,
} = promocodeSlice.actions;

export default promocodeSlice.reducer;

