import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, newsChangeStatus, deleteNews } from 'services/news.service';
import { getPage } from 'utils/common';

export const fetchNewsList = createAsyncThunk(
  'news/fetchNewsList',
  async (options, { rejectWithValue }) => {
    try {
      const listData = await list(options);
      if (listData.status === true) {
        return {
          data: listData?.result || [],
          count: listData?.count || 0,
          totalPages: getPage(listData?.count || 1, options?.limit || 10),
        };
      }
      return rejectWithValue(listData?.message || 'Failed to fetch news');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const changeNewsStatus = createAsyncThunk(
  'news/changeNewsStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const res = await newsChangeStatus({ editId: parseInt(editId), status });
      if (res.status === true) {
        return { id: parseInt(editId), status, message: 'Status changed successfully.' };
      }
      return rejectWithValue(res?.message || 'Failed to change status');
    } catch (error) {
      return rejectWithValue(error.message || 'Operation not perform yet! please try in some time.');
    }
  }
);

export const deleteNewsAction = createAsyncThunk(
  'news/deleteNews',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId } = payload;
      const res = await deleteNews({ editId: parseInt(editId) });
      if (res.status === true) {
        return { id: parseInt(editId), message: 'News deleted successfully.' };
      }
      return rejectWithValue(res?.message || 'Failed to delete news');
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
  filter: { from: '', to: '', filter_by: '', search: '' },
  showRequest: '',
};

const newsSlice = createSlice({
  name: 'news',
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
    resetNewsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchNewsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) state.totalPages = getPage(1);
      })
      .addCase(fetchNewsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    builder
      .addCase(changeNewsStatus.fulfilled, (state, action) => {
        const idx = state.listData.findIndex(n => n.id === action.payload.id);
        if (idx !== -1) state.listData[idx].status = action.payload.status;
      })
      .addCase(changeNewsStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteNewsAction.fulfilled, (state, action) => {
        state.listData = state.listData.filter(n => n.id !== action.payload.id);
        state.count = state.count - 1;
      })
      .addCase(deleteNewsAction.rejected, (state, action) => {
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
  resetNewsState,
} = newsSlice.actions;

export default newsSlice.reducer;
