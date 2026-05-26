import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboard.slice';
import usersReducer from './slices/users.slice';
import accountsReducer from './slices/accounts.slice';
import bannerReducer from './slices/banners.slice';
import faqReducer from './slices/faqs.slice';
import articleReducer from './slices/articles.slice';
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
    accounts: accountsReducer,
    banners: bannerReducer,
    faqs: faqReducer,
    articles: articleReducer,
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
