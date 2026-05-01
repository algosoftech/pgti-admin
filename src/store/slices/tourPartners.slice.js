// Tour Partners uses a single-record CMS model (no Redux list needed).
// Kept as a minimal placeholder so store/index.js import stays valid.
import { createSlice } from '@reduxjs/toolkit';

const tourPartnersSlice = createSlice({
    name: 'tourPartners',
    initialState: {},
    reducers: {},
});

export default tourPartnersSlice.reducer;
