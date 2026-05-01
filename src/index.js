import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { PermissionProvider } from "contexts/PermissionContext";
import { Provider } from 'react-redux';
import { store } from 'store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </Router>
  </Provider>
);
