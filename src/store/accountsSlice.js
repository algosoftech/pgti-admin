import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, chnageStatus } from '../controllers/subAdmin/subAdminControllers';
import { getPage } from '../controllers/common';

// Async thunk for fetching accounts list
export const fetchAccountsList = createAsyncThunk(
  'accounts/fetchAccountsList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch accounts');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing account status
export const changeAccountStatus = createAsyncThunk(
  'accounts/changeAccountStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { id, status } = payload;
      const options = {
        url: `admin/accounts/sub-admin/changeStatus`,
        postData: {
          id: id,
          status: status,
        },
      };
      const res = await chnageStatus(options);
      if (res.status === true) {
        return { id, status, message: 'Status changed successfully.' };
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
    to: new Date(),
    filter_by: '',
    search: '',
  },
  showRequest: '',
};

const accountsSlice = createSlice({
  name: 'accounts',
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
        to: new Date(),
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
    resetAccountsState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch accounts list
    builder
      .addCase(fetchAccountsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchAccountsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchAccountsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change account status
    builder
      .addCase(changeAccountStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeAccountStatus.fulfilled, (state, action) => {
        // Update the account status in the list
        const accountIndex = state.listData.findIndex(
          (account) => account.id === action.payload.id
        );
        if (accountIndex !== -1) {
          state.listData[accountIndex].status = action.payload.status;
        }
      })
      .addCase(changeAccountStatus.rejected, (state, action) => {
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
  resetAccountsState,
} = accountsSlice.actions;

export default accountsSlice.reducer;

