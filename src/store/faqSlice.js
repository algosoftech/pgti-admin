import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, faqChangeStatus, deleteFaq } from '../controllers/V1/faqController';
import { getPage } from '../controllers/common';

// Async thunk for fetching FAQs list
export const fetchFaqsList = createAsyncThunk(
  'faqs/fetchFaqsList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch FAQs');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing FAQ status
export const changeFaqStatus = createAsyncThunk(
  'faqs/changeFaqStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await faqChangeStatus(option);
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

// Async thunk for deleting FAQ
export const deleteFaqAction = createAsyncThunk(
  'faqs/deleteFaq',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId } = payload;
      const option = {
        editId: parseInt(editId),
      };
      const res = await deleteFaq(option);
      if (res.status === true) {
        return { id: parseInt(editId), message: 'FAQ deleted successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to delete FAQ');
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

const faqSlice = createSlice({
  name: 'faqs',
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
    resetFaqState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch FAQs list
    builder
      .addCase(fetchFaqsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchFaqsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchFaqsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change FAQ status
    builder
      .addCase(changeFaqStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeFaqStatus.fulfilled, (state, action) => {
        // Update the FAQ status in the list
        const faqIndex = state.listData.findIndex(
          (faq) => faq.id === action.payload.id
        );
        if (faqIndex !== -1) {
          state.listData[faqIndex].status = action.payload.status;
        }
      })
      .addCase(changeFaqStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete FAQ
    builder
      .addCase(deleteFaqAction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteFaqAction.fulfilled, (state, action) => {
        // Remove the FAQ from the list
        state.listData = state.listData.filter(
          (faq) => faq.id !== action.payload.id
        );
        state.count = state.count - 1;
      })
      .addCase(deleteFaqAction.rejected, (state, action) => {
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
  resetFaqState,
} = faqSlice.actions;

export default faqSlice.reducer;

