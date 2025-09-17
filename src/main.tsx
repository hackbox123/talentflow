// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { seedDatabase } from './api/seed.ts';

async function enableMocking() {
  // Run the seeder function
  await seedDatabase();

  const { worker } = await import('./api/browser.ts');

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and running.
  return worker.start({
    onUnhandledRequest: 'bypass', // Pass through any requests that we don't handle
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
});