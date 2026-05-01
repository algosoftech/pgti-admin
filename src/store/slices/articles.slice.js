import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, articleChangeStatus, deleteArticle } from 'services/articles.service';
import { getPage } from 'utils/common';

// Async thunk for fetching articles list
export const fetchArticlesList = createAsyncThunk(
  'articles/fetchArticlesList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch articles');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing article status
export const changeArticleStatus = createAsyncThunk(
  'articles/changeArticleStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await articleChangeStatus(option);
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

// Async thunk for deleting article
export const deleteArticleAction = createAsyncThunk(
  'articles/deleteArticle',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId } = payload;
      const option = {
        editId: parseInt(editId),
      };
      const res = await deleteArticle(option);
      if (res.status === true) {
        return { id: parseInt(editId), message: 'Article deleted successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to delete article');
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

const articleSlice = createSlice({
  name: 'articles',
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
    resetArticleState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch articles list
    builder
      .addCase(fetchArticlesList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchArticlesList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchArticlesList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change article status
    builder
      .addCase(changeArticleStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeArticleStatus.fulfilled, (state, action) => {
        // Update the article status in the list
        const articleIndex = state.listData.findIndex(
          (article) => article.id === action.payload.id
        );
        if (articleIndex !== -1) {
          state.listData[articleIndex].status = action.payload.status;
        }
      })
      .addCase(changeArticleStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete article
    builder
      .addCase(deleteArticleAction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteArticleAction.fulfilled, (state, action) => {
        // Remove the article from the list
        state.listData = state.listData.filter(
          (article) => article.id !== action.payload.id
        );
        state.count = state.count - 1;
      })
      .addCase(deleteArticleAction.rejected, (state, action) => {
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
  resetArticleState,
} = articleSlice.actions;

export default articleSlice.reducer;

