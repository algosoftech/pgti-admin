import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, usersChangeStatus } from '../controllers/V1/usersController';
import { getPage } from '../controllers/common';

// Async thunk for fetching users list
export const fetchUsersList = createAsyncThunk(
  'users/fetchUsersList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch users');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing user status
export const changeUserStatus = createAsyncThunk(
  'users/changeUserStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { user_id, status } = payload;
      const option = {
        user_id: parseInt(user_id),
        status: status,
      };
      const res = await usersChangeStatus(option);
      if (res.status === true) {
        return { user_id, status, message: 'Status changed successfully.' };
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

const usersSlice = createSlice({
  name: 'users',
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
    resetUsersState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch users list
    builder
      .addCase(fetchUsersList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change user status
    builder
      .addCase(changeUserStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        // Update the user status in the list
        const userIndex = state.listData.findIndex(
          (user) => user.id === action.payload.user_id
        );
        if (userIndex !== -1) {
          state.listData[userIndex].status = action.payload.status;
        }
      })
      .addCase(changeUserStatus.rejected, (state, action) => {
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
  resetUsersState,
} = usersSlice.actions;

export default usersSlice.reducer;

