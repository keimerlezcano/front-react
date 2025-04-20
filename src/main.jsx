// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// --- QUITAR O COMENTAR ESTA LÍNEA ---
// import { AuthProvider } from './context/AuthProvider.jsx'; // <-- ¡Elimina o comenta esta línea!

// --- Tus otros providers (Asegúrate que los nombres coincidan con tus archivos) ---
import { SedeProvider } from './context/SedeProvider.jsx'; // Verifica si este archivo existe y se llama así
import { EjemplarProvider } from './context/EjemplarProvider.jsx'; // Verifica si este archivo existe y se llama así
// import { ContractProvider } from './context/ContractContext.jsx'; // Descomenta si también usas este

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <SedeProvider>
        <EjemplarProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
        </EjemplarProvider>
      </SedeProvider>
  </React.StrictMode>,
)