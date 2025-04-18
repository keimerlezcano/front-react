// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ContractProvider } from './context/ContractContext'; // <-- 1. Importa el ContractProvider
// import { AuthProvider } from './context/AuthContext'; // <-- 2. Descomenta e importa si usas AuthProvider


ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
       {/* <AuthProvider>  */} {/* <-- 3. Envuelve con AuthProvider (si existe) */}
        <ContractProvider> {/* <-- 4. Envuelve con ContractProvider */}
          <App /> 
        </ContractProvider> 
       {/* </AuthProvider> */} {/* <-- 6. Cierra AuthProvider (si existe) */}
    </BrowserRouter>
  // </React.StrictMode>
);