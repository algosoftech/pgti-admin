import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboard.slice';
import usersReducer from './slices/users.slice';
import categoryReducer from './slices/categories.slice';
import subCategoryReducer from './slices/subCategories.slice';
import productReducer from './slices/products.slice';
import productVariantReducer from './slices/productVariants.slice';
import accountsReducer from './slices/accounts.slice';
import bannerReducer from './slices/banners.slice';
import faqReducer from './slices/faqs.slice';
import contactShopReducer from './slices/contactShops.slice';
import promocodeReducer from './slices/promocodes.slice';
import orderReducer from './slices/orders.slice';
import articleReducer from './slices/articles.slice';
import ingredientReducer from './slices/ingredients.slice';
import eventReducer from './slices/events.slice';
import highlightVideoReducer from './slices/highlightVideos.slice';
import tourPartnersReducer from './slices/tourPartners.slice';
import newsReducer from './slices/news.slice';
import emailTemplatesReducer from './slices/emailTemplates.slice';
import tournamentResultsReducer from './slices/tournamentResults.slice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
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
    highlightVideos: highlightVideoReducer,
    tourPartners: tourPartnersReducer,
    news: newsReducer,
    emailTemplates: emailTemplatesReducer,
    tournamentResults: tournamentResultsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates', 'accounts.filter.to', 'accounts.filter.from'],
      },
    }),
});
