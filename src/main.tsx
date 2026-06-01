import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

const rootEl = document.getElementById('root') as HTMLElement;

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, <React.StrictMode><App /></React.StrictMode>);
} else {
  ReactDOM.createRoot(rootEl).render(<React.StrictMode><App /></React.StrictMode>);
}
