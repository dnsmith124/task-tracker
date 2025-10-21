import React from 'react';
import { AppProvider } from '@/context/AppContext';
import Dashboard from '@/pageRoutes/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/assets/styles/global.scss';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Dashboard />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AppProvider>
  );
};

export default App;

