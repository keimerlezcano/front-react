import React, { useState } from "react"; // Importa useState
import { Link, useLocation } from "react-router-dom";
import {
  FaBars, FaTimes, FaHome, FaUser, FaCog, FaHorse, FaMoneyBill,
  FaFileContract, FaClinicMedical, FaBuilding, FaUsers,
  FaUserCircle, FaSignOutAlt,
  FaNotesMedical, // Icono para Historial Seguimiento
  FaChevronDown, // Icono para flecha desplegable
  FaSyringe, // Icono específico para Vacunación (opcional)
  FaAppleAlt // Icono específico para Alimentación (opcional)
} from "react-icons/fa";
import "./Navbar.css";
import logo from "../assets/logo.png";

const Sidebar = ({ isOpen, toggleMenu, handleLogout }) => {
  const location = useLocation();
  // Estado para controlar si el submenú de Historial está abierto
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);

  // Función para abrir/cerrar el submenú
  const toggleHistorialMenu = () => {
    // Solo permite abrir/cerrar si el sidebar está expandido
    if (isOpen) {
        setIsHistorialOpen(!isHistorialOpen);
    }
  };

  // Determinar si alguna ruta del submenú está activa
  const isHistorialActive = [
    '/medicines',
    '/vacunacion',
    '/alimentacion'
  ].includes(location.pathname);

  // Cierra el submenú si el sidebar se colapsa
  React.useEffect(() => {
    if (!isOpen) {
      setIsHistorialOpen(false);
    }
  }, [isOpen]);


  return (
    <>
      <nav className={`sidebar ${isOpen ? "active" : "collapsed"}`}>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <div className="sidebar-menu-wrapper">
          {/* --- Menú Principal --- */}
          <ul className="sidebar-menu">
            {/* --- Perfil --- */}
            <li className={location.pathname === "/perfil" ? "active-link" : ""}>
              <Link to="/perfil">
                <FaUserCircle className="icon" /> {isOpen && "Perfil"}
              </Link>
            </li>

            {/* --- Dashboard --- */}
            <li className={location.pathname === "/dashboard" ? "active-link" : ""}>
              <Link to="/dashboard">
                <FaHome className="icon" /> {isOpen && "Dashboard"}
              </Link>
            </li>

            {/* --- Servicios --- */}
            <li className={location.pathname === "/services" ? "active-link" : ""}>
              <Link to="/services">
                <FaCog className="icon" /> {isOpen && "Servicios"}
              </Link>
            </li>

             {/* --- Roles --- */}
             <li className={location.pathname === "/roles" ? "active-link" : ""}>
              <Link to="/roles">
                <FaUser className="icon" /> {isOpen && "Roles"}
              </Link>
            </li>

             {/* --- Usuarios --- */}
             <li className={location.pathname === "/users" ? "active-link" : ""}>
              <Link to="/users">
                <FaUsers className="icon" /> {isOpen && "Usuarios"}
              </Link>
            </li>

             {/* --- Sedes --- */}
            <li className={location.pathname === "/sedes" ? "active-link" : ""}>
              <Link to="/sedes">
                <FaBuilding className="icon" /> {isOpen && "Sedes"}
              </Link>
            </li>

             {/* --- Ejemplares --- */}
             <li className={location.pathname === "/specimens" ? "active-link" : ""}>
              <Link to="/specimens">
                <FaHorse className="icon" /> {isOpen && "Ejemplares"}
              </Link>
            </li>

             {/* --- Clientes --- */}
             <li className={location.pathname === "/clients" ? "active-link" : ""}>
              <Link to="/clients">
                <FaUser className="icon" /> {isOpen && "Clientes"}
              </Link>
            </li>

             {/* --- Contratos --- */}
             <li className={location.pathname === "/contracts" ? "active-link" : ""}>
              <Link to="/contracts">
                <FaFileContract className="icon" /> {isOpen && "Contratos"}
              </Link>
            </li>

             {/* --- Pagos --- */}
             <li className={location.pathname === "/payments" ? "active-link" : ""}>
              <Link to="/payments">
                <FaMoneyBill className="icon" /> {isOpen && "Pagos"}
              </Link>
            </li>


            {/* --- Desplegable Historial Seguimiento --- */}
            <li className={`dropdown-item ${isHistorialOpen ? 'open' : ''} ${isHistorialActive && !isHistorialOpen ? 'active-parent' : ''}`}>
              <button
                onClick={toggleHistorialMenu}
                className={`dropdown-toggle ${isHistorialActive ? 'active-parent-button' : ''}`}
                aria-expanded={isHistorialOpen}
              >
                <FaNotesMedical className="icon" />
                {isOpen && <span className="menu-text">Historial Seguimiento</span>}
                {isOpen && <FaChevronDown className={`arrow-icon ${isHistorialOpen ? 'open' : ''}`} />}
              </button>

              {/* Submenú (AHORA SIEMPRE PRESENTE EN EL DOM para la transición/posicionamiento colapsado) */}
              <ul className={`submenu ${isHistorialOpen ? 'open' : ''}`}>
                  <li className={location.pathname === "/medicines" ? "active-link" : ""}>
                  <Link to="/medicines">
                      <FaClinicMedical className="icon submenu-icon" /> {isOpen && "Medicinas"}
                  </Link>
                  </li>
                  <li className={location.pathname === "/alimentacion" ? "active-link" : ""}>
                  <Link to="/alimentacion">
                      <FaAppleAlt className="icon submenu-icon" /> {isOpen && "Alimentación"}
                  </Link>
                  </li>
                  <li className={location.pathname === "/vacunacion" ? "active-link" : ""}>
                  <Link to="/vacunacion">
                      <FaSyringe className="icon submenu-icon" /> {isOpen && "Vacunación"}
                  </Link>
                  </li>
              </ul>
            </li>
            {/* --- Fin Desplegable --- */}

          </ul>

          {/* --- Sección Inferior (Logout) --- */}
          <ul className="sidebar-menu sidebar-bottom-menu">
            <li>
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt className="icon" /> {isOpen && "Cerrar Sesión"}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Botón para abrir/cerrar sidebar */}
      <button className="menu-btn" onClick={toggleMenu}>
        {isOpen ? <FaTimes className="menu-icon" /> : <FaBars className="menu-icon" />}
      </button>
    </>
  );
};

export default Sidebar;