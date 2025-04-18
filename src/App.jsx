// src/App.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Layouts y Componentes ---
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute'; 

// import DashboardPage from './pages/DashboardPage'; // Descomenta si existe
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/Users'; 
import ServicesPage from './pages/Services'; 
import SedesPage from './pages/VenuesPage'; 
import SpecimenPage from './pages/SpecimenPage';
import ClientsPage from './pages/ClientsPage';
import ContractsPage from './pages/ContractsPage';
import MedicinesPage from './pages/Medicine'; 
import PaymentsPage from './pages/Pagos'; 
import AlimentacionPage from './pages/AlimentacionPage';
import VacunacionPage from './pages/VacunacionPage';

const App = () => {
  return (
    <Routes>
      {/* Ruta pública para Login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta padre protegida que usa MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute> {/* Envuelve MainLayout */}
            <MainLayout /> {/* Contiene Sidebar y Outlet */}
          </ProtectedRoute>
        }
      >
        {/* Rutas hijas renderizadas en el Outlet de MainLayout */}
        {/* Redirección inicial (Descomenta si tienes Dashboard) */}
        {/* <Route index element={<Navigate to="/dashboard" replace />} /> */}
        {/* <Route path="dashboard" element={<DashboardPage />} /> */}

        {/* Si no hay dashboard, redirige a roles u otra página inicial */}
         <Route index element={<Navigate to="/roles" replace />} /> {/* Ejemplo: redirigir a roles */}


        <Route path="roles" element={<RolesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="sedes" element={<SedesPage />} />
        <Route path="specimens" element={<SpecimenPage />} /> 
        <Route path="clients" element={<ClientsPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="alimentacion" element={<AlimentacionPage />} />
        <Route path="vacunacion" element={<VacunacionPage />} />

        {/* Ruta catch-all DENTRO del layout */}
        <Route path="*" element={<div>404 - Página no encontrada dentro de la aplicación</div>} />

      </Route> {/* Fin ruta padre MainLayout */}

      {/* Ruta catch-all GLOBAL (si se accede a una ruta no definida y no está logueado) */}
       <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};

export default App;