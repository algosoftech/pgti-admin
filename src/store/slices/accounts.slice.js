import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, chnageStatus, deleteAccount } from 'services/accounts.service';
import { getPage } from 'utils/common';

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
      const options = { id, status };
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

export const deleteAccountAction = createAsyncThunk(
  'accounts/deleteAccount',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await deleteAccount({ id: payload.id });
      if (res.status === true) return { id: payload.id };
      return rejectWithValue(res?.message || 'Failed to delete');
    } catch (error) {
      return rejectWithValue(error.message || 'Operation failed');
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
    to: '', // store as ISO string or '' for serializable Redux state
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
      const payload = { ...action.payload };
      // Keep Redux state serializable: store dates as ISO strings, never Date objects
      if (payload.to instanceof Date) payload.to = payload.to.toISOString?.() ?? '';
      if (payload.from instanceof Date) payload.from = payload.from.toISOString?.() ?? '';
      state.filter = { ...state.filter, ...payload };
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

    builder
      .addCase(deleteAccountAction.fulfilled, (state, action) => {
        state.listData = state.listData.filter((a) => a.id !== action.payload.id);
        state.count = Math.max(0, state.count - 1);
      })
      .addCase(deleteAccountAction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage, setLimit, setFilter,
  resetFilter, setShowRequest, resetAccountsState,
} = accountsSlice.actions;

export default accountsSlice.reducer;

