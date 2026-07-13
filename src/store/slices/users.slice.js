import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, usersChangeStatus, usersChangeRestriction, deletePlayer } from 'services/users.service';
import { getPage } from 'utils/common';

export const fetchUsersList = createAsyncThunk(
  'users/fetchUsersList',
  async (options, { rejectWithValue }) => {
    try {
      const listData = await list(options);
      if (listData.status === true) {
        return {
          data: listData?.result || [],
          count: listData?.count || 0,
          stats: listData?.stats || { total: listData?.count || 0, active: 0, inactive: 0, restricted: 0, alumni: 0 },
          totalPages: getPage(listData?.count || 1, options?.limit || 10),
        };
      }
      return rejectWithValue(listData?.message || 'Failed to fetch players');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const changeUserStatus = createAsyncThunk(
  'users/changeUserStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await usersChangeStatus({ id: payload.id, status: payload.status });
      if (res.status === true) {
        return { id: payload.id, status: payload.status };
      }
      return rejectWithValue(res?.message || 'Failed to change status');
    } catch (error) {
      return rejectWithValue(error.message || 'Operation failed');
    }
  }
);

export const changeUserRestriction = createAsyncThunk(
  'users/changeUserRestriction',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await usersChangeRestriction({ id: payload.id, is_restricted: payload.is_restricted });
      if (res.status === true) {
        return { id: payload.id, is_restricted: payload.is_restricted };
      }
      return rejectWithValue(res?.message || 'Failed to update restriction');
    } catch (error) {
      return rejectWithValue(error.message || 'Operation failed');
    }
  }
);

export const deletePlayerAction = createAsyncThunk(
  'users/deletePlayer',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await deletePlayer({ editId: payload.id });
      if (res.status === true) {
        return { id: payload.id };
      }
      return rejectWithValue(res?.message || 'Failed to delete player');
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
  stats: { total: 0, active: 0, inactive: 0, restricted: 0, alumni: 0 },
  filter: { from: '', to: '', filter_by: '', search: '' },
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
      state.filter = { from: '', to: '', filter_by: '', search: '' };
      state.skip = 0;
      state.currentPage = 1;
    },
    setShowRequest: (state, action) => {
      state.showRequest = action.payload;
      state.skip = 0;
      state.currentPage = 1;
    },
    resetUsersState: () => initialState,
  },
  extraReducers: (builder) => {
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
        state.stats = action.payload.stats || initialState.stats;
        state.totalPages = action.payload.totalPages || getPage(1);
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
        state.stats = initialState.stats;
      });

    builder
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        const idx = state.listData.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.listData[idx].status = action.payload.status;
      })
      .addCase(changeUserStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(changeUserRestriction.fulfilled, (state, action) => {
        const idx = state.listData.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.listData[idx].is_restricted = action.payload.is_restricted;
      })
      .addCase(changeUserRestriction.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deletePlayerAction.fulfilled, (state, action) => {
        state.listData = state.listData.filter((u) => u.id !== action.payload.id);
        state.count = Math.max(0, state.count - 1);
      })
      .addCase(deletePlayerAction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage, setLimit, setFilter,
  resetFilter, setShowRequest, resetUsersState,
} = usersSlice.actions;

export default usersSlice.reducer;
