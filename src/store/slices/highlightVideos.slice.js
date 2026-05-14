import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, highlightVideoChangeStatus } from 'services/highlightVideo.service';
import { getPage } from 'utils/common';

export const fetchHighlightVideosList = createAsyncThunk(
  'highlightVideos/fetchHighlightVideosList',
  async (options, { rejectWithValue }) => {
    try {
      const validatedOptions = {
        ...options,
        skip: Math.max(0, parseInt(options?.skip || 0, 10) || 0),
        limit: Math.min(100, Math.max(1, parseInt(options?.limit || 10, 10) || 10)),
        condition: options?.condition || {}
      };
      const listData = await list(validatedOptions);
      if (listData.status === true) {
        const count = listData?.count || 0;
        const limit = validatedOptions.limit;
        const totalPages = getPage(count, limit);
        return {
          data: Array.isArray(listData?.result) ? listData.result : [],
          count,
          totalPages,
          pagination: listData?.pagination || {
            currentPage: Math.floor(validatedOptions.skip / limit) + 1,
            totalPages,
            limit,
            skip: validatedOptions.skip,
            totalCount: count,
            hasNextPage: validatedOptions.skip + limit < count,
            hasPreviousPage: validatedOptions.skip > 0
          }
        };
      }
      return rejectWithValue(listData?.message || 'Failed to fetch list');
    } catch (error) {
      console.error('fetchHighlightVideosList error:', error);
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const changeHighlightVideoStatus = createAsyncThunk(
  'highlightVideos/changeHighlightVideoStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const res = await highlightVideoChangeStatus({ editId: parseInt(editId), status });
      if (res.status === true) {
        return { id: parseInt(editId), status, message: 'Status changed successfully.' };
      }
      return rejectWithValue(res?.message || 'Failed to change status');
    } catch (error) {
      return rejectWithValue(error.message || 'Operation failed.');
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
  filter: { from: '', to: '', filter_by: '', search: '' },
  showRequest: ''
};

const highlightVideoSlice = createSlice({
  name: 'highlightVideos',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      const page = Math.max(1, parseInt(action.payload, 10) || 1);
      state.currentPage = page;
      state.skip = (page - 1) * state.limit;
    },
    setLimit: (state, action) => {
      const limit = Math.min(100, Math.max(1, parseInt(action.payload, 10) || 10));
      state.limit = limit;
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHighlightVideosList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchHighlightVideosList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = Array.isArray(action.payload.data) ? action.payload.data : [];
        const newCount = action.payload.count || 0;
        const currentLimit = state.limit || 10;
        state.count = newCount;
        state.totalPages = action.payload.pagination?.totalPages || getPage(newCount, currentLimit);
        if (state.totalPages < 1) state.totalPages = 1;
        if (state.currentPage > state.totalPages) state.currentPage = state.totalPages;
        if (state.currentPage < 1) state.currentPage = 1;
        state.skip = (state.currentPage - 1) * currentLimit;
      })
      .addCase(fetchHighlightVideosList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      })
      .addCase(changeHighlightVideoStatus.fulfilled, (state, action) => {
        const index = state.listData.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.listData[index].status = action.payload.status;
      });
  }
});

export const {
  setCurrentPage,
  setLimit,
  setFilter,
  resetFilter,
  setShowRequest
} = highlightVideoSlice.actions;
export default highlightVideoSlice.reducer;
