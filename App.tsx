import React from 'react';
import { ToastContainer } from 'react-toastify';
import Aviator from './components/aviator/index';
import SVGs from './components/svgs';
import AviatorProvider from './store/aviator';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SnackbarProvider } from 'notistack';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AviatorProvider>
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <SVGs />
          <Routes>
            <Route path="/aviator" element={<Aviator />} />
            <Route path="/" element={<Navigate to="/aviator" replace />} />
            <Route path="*" element={<Navigate to="/aviator" replace />} />
          </Routes>
          <ToastContainer theme="colored" position="top-right" />
        </BrowserRouter>
      </SnackbarProvider>
    </AviatorProvider>
  );
}

export default App;