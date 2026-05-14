import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, bannerChangeStatus } from 'services/banner.service';
import { getPage } from 'utils/common';

// Async thunk for fetching banners list
export const fetchBannersList = createAsyncThunk(
  'banners/fetchBannersList',
  async (options, { rejectWithValue }) => {
    try {
      // Validate and sanitize options
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
      } else {
        return rejectWithValue(listData?.message || 'Failed to fetch banners');
      }
    } catch (error) {
      console.error('fetchBannersList error:', error);
      return rejectWithValue(error.message || 'An error occurred while fetching banners');
    }
  }
);

// Async thunk for changing banner status
export const changeBannerStatus = createAsyncThunk(
  'banners/changeBannerStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await bannerChangeStatus(option);
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

const bannerSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      const page = Math.max(1, parseInt(action.payload, 10) || 1);
      console.log('setCurrentPage reducer called:', { oldPage: state.currentPage, newPage: page, limit: state.limit });
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
    resetBannerState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch banners list
    builder
      .addCase(fetchBannersList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchBannersList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = Array.isArray(action.payload.data) ? action.payload.data : [];
        const newCount = action.payload.count || 0;
        const currentLimit = state.limit || 10;
        
        // Use backend's pagination.totalPages if available, otherwise calculate
        const backendTotalPages = action.payload.pagination?.totalPages;
        const calculatedTotalPages = getPage(newCount, currentLimit);
        state.totalPages = backendTotalPages || calculatedTotalPages;
        
        // Ensure totalPages is at least 1
        if (state.totalPages < 1) {
          state.totalPages = 1;
        }
        
        // Update count
        state.count = newCount;
        
        // Verify currentPage is valid - don't override it unless it's invalid
        // The currentPage should already be set correctly by setCurrentPage reducer
        // Only adjust if it's out of bounds
        if (state.currentPage > state.totalPages) {
          state.currentPage = state.totalPages;
        }
        if (state.currentPage < 1) {
          state.currentPage = 1;
        }
        
        // Synchronize skip with currentPage and limit
        state.skip = (state.currentPage - 1) * currentLimit;
        
        // Ensure skip doesn't exceed total count
        const maxSkip = Math.max(0, newCount - currentLimit);
        if (state.skip > maxSkip && newCount > 0) {
          state.skip = Math.max(0, maxSkip);
          state.currentPage = Math.max(1, Math.floor(state.skip / currentLimit) + 1);
        }
        
        // Debug logging
        console.log('Pagination state updated:', {
          count: newCount,
          limit: currentLimit,
          totalPages: state.totalPages,
          currentPage: state.currentPage,
          skip: state.skip,
          backendTotalPages,
          backendCurrentPage: action.payload.pagination?.currentPage,
          receivedSkip: action.payload.pagination?.skip
        });
      })
      .addCase(fetchBannersList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change banner status
    builder
      .addCase(changeBannerStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeBannerStatus.fulfilled, (state, action) => {
        // Update the banner status in the list
        const bannerIndex = state.listData.findIndex(
          (banner) => banner.id === action.payload.id
        );
        if (bannerIndex !== -1) {
          state.listData[bannerIndex].status = action.payload.status;
        }
      })
      .addCase(changeBannerStatus.rejected, (state, action) => {
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
  resetBannerState,
} = bannerSlice.actions;

export default bannerSlice.reducer;
