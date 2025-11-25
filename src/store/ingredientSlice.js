import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, ingredientChangeStatus, deleteIngredient } from '../controllers/V1/ingredientController';
import { getPage } from '../controllers/common';

// Async thunk for fetching ingredients list
export const fetchIngredientsList = createAsyncThunk(
  'ingredients/fetchIngredientsList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch ingredients');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing ingredient status
export const changeIngredientStatus = createAsyncThunk(
  'ingredients/changeIngredientStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await ingredientChangeStatus(option);
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

// Async thunk for deleting ingredient
export const deleteIngredientAction = createAsyncThunk(
  'ingredients/deleteIngredient',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId } = payload;
      const option = {
        editId: parseInt(editId),
      };
      const res = await deleteIngredient(option);
      if (res.status === true) {
        return { id: parseInt(editId), message: 'Ingredient deleted successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to delete ingredient');
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

const ingredientSlice = createSlice({
  name: 'ingredients',
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
    resetIngredientState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch ingredients list
    builder
      .addCase(fetchIngredientsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchIngredientsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchIngredientsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change ingredient status
    builder
      .addCase(changeIngredientStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeIngredientStatus.fulfilled, (state, action) => {
        // Update the ingredient status in the list
        const ingredientIndex = state.listData.findIndex(
          (ingredient) => ingredient.id === action.payload.id
        );
        if (ingredientIndex !== -1) {
          state.listData[ingredientIndex].status = action.payload.status;
        }
      })
      .addCase(changeIngredientStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete ingredient
    builder
      .addCase(deleteIngredientAction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteIngredientAction.fulfilled, (state, action) => {
        // Remove the ingredient from the list
        state.listData = state.listData.filter(
          (ingredient) => ingredient.id !== action.payload.id
        );
        state.count = state.count - 1;
      })
      .addCase(deleteIngredientAction.rejected, (state, action) => {
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
  resetIngredientState,
} = ingredientSlice.actions;

export default ingredientSlice.reducer;

