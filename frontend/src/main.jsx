import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans';
import './styles.css';
import App from './App';
import { ProfileProvider } from './lib/store';
import { PreferencesProvider } from './lib/preferences';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </PreferencesProvider>
  </StrictMode>,
);

// Service worker = offline support + "Add to Home Screen" install. Production builds only,
// so it never caches stale code during development.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
