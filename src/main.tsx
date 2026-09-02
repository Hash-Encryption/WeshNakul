import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { LocaleProvider } from './context/LocaleContext';
import { RoomProvider } from './context/RoomContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <RoomProvider>
        <App />
      </RoomProvider>
    </LocaleProvider>
  </StrictMode>
);
