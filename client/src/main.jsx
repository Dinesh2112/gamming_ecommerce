import React from 'react'; // 👈 ADD THIS LINE
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Provider } from 'react-redux';
import store from './app/store';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <UserProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px'
              },
              duration: 3000
            }}
          />
        </UserProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
