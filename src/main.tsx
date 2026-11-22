import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register offline service worker only on HTTP(S) origins; Electron file:// loads directly from disk.
if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  (window.location.protocol === 'https:' || window.location.protocol === 'http:')
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Ignore registration failures in restricted preview frames
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
