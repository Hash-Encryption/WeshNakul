import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { LocaleProvider } from './context/LocaleContext';
import { RoomProvider } from './context/RoomContext';
import { ApplicationErrorBoundary } from './components/common/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApplicationErrorBoundary>
      <LocaleProvider>
        <RoomProvider>
          <App />
        </RoomProvider>
      </LocaleProvider>
    </ApplicationErrorBoundary>
  </StrictMode>
);
