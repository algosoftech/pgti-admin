import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listTournamentResults, deleteTournamentResult } from 'services/tournamentResults.service';
import { getPage } from 'utils/common';

export const fetchTournamentResultsList = createAsyncThunk(
  'tournamentResults/fetchList',
  async (options, { rejectWithValue }) => {
    try {
      const res = await listTournamentResults(options);
      if (res.status === true) {
        return {
          data: res.result || [],
          count: res.count || 0,
          totalPages: getPage(res.count || 1, options?.limit || 10),
        };
      }
      return rejectWithValue(res?.message || 'Failed to fetch tournament results');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteTournamentResultAction = createAsyncThunk(
  'tournamentResults/delete',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await deleteTournamentResult({ editId: payload.id });
      if (res.status === true) {
        return { id: payload.id };
      }
      return rejectWithValue(res?.message || 'Failed to delete result');
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
  filter: { from: '', to: '', season: '', month: '', search: '' },
};

const tournamentResultsSlice = createSlice({
  name: 'tournamentResults',
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
      state.filter = { from: '', to: '', season: '', month: '', search: '' };
      state.skip = 0;
      state.currentPage = 1;
    },
    resetTournamentResultsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournamentResultsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchTournamentResultsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages || getPage(1);
      })
      .addCase(fetchTournamentResultsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    builder
      .addCase(deleteTournamentResultAction.fulfilled, (state, action) => {
        state.listData = state.listData.filter((r) => r.id !== action.payload.id);
        state.count = Math.max(0, state.count - 1);
      })
      .addCase(deleteTournamentResultAction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage, setLimit, setFilter,
  resetFilter, resetTournamentResultsState,
} = tournamentResultsSlice.actions;

export default tournamentResultsSlice.reducer;
