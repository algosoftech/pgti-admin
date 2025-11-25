import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './usersSlice';
import categoryReducer from './categorySlice';
import subCategoryReducer from './subCategorySlice';
import productReducer from './productSlice';
import productVariantReducer from './productVariantSlice';
import accountsReducer from './accountsSlice';
import bannerReducer from './bannerSlice';
import faqReducer from './faqSlice';
import contactShopReducer from './contactShopSlice';
import promocodeReducer from './promocodeSlice';
import orderReducer from './orderSlice';
import articleReducer from './articleSlice';
import ingredientReducer from './ingredientSlice';
import eventReducer from './eventSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    categories: categoryReducer,
    subCategories: subCategoryReducer,
    products: productReducer,
    productVariants: productVariantReducer,
    accounts: accountsReducer,
    banners: bannerReducer,
    faqs: faqReducer,
    contactShops: contactShopReducer,
    promocodes: promocodeReducer,
    orders: orderReducer,
    articles: articleReducer,
    ingredients: ingredientReducer,
    events: eventReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

// Type definitions for TypeScript (if needed in future)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

