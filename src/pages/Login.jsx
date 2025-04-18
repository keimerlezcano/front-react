// src/pages/Login.jsx

import React, { useState } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Card,
  CardBody,
  CardTitle,
  Spinner
} from 'reactstrap';
import { loginUserApi } from '../api/userApi';
import { useNavigate } from "react-router-dom";


import '../assets/Login.css';

// import logoCriadero from '/img/logo-criadero.png';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alertInfo, setAlertInfo] = useState({ visible: false, message: '', color: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlertInfo({ visible: false, message: '', color: '' });
    setIsLoading(true);

    try {
      const credentials = { username, password };
      await loginUserApi(credentials); // No necesitamos guardar la respuesta aquí
      navigate('/dashboard'); // Redirige al éxito

    } catch (error) {
      setAlertInfo({
        visible: true,
        message: error.message || 'Credenciales inválidas o error del servidor.',
        color: 'danger'
      });
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal con Flexbox para dividir
    <div className="login-split-container">

      {/* Mitad Izquierda - Imagen */}
      <div className="login-image-half">
        {/* Puedes poner contenido aquí sobre la imagen si quieres, como un título */}
        {/* <h1 style={{ color: 'white', zIndex: 2, textShadow: '1px 1px 3px black' }}>Criadero La Miel</h1> */}
      </div>

      {/* Mitad Derecha - Formulario */}
      <div className="login-form-half">
        {/* Tarjeta interna para el formulario */}
        <Card className="login-form-card">
          <CardBody>

            {/* Logo Opcional dentro del Formulario */}
            {/* <img src={logoCriadero} alt="Logo Criadero" className="login-form-logo" /> */}

            <CardTitle tag="h4" className="login-form-title">
               Iniciar Sesión
            </CardTitle>
            <p className="text-center text-muted mb-4" style={{marginTop:"-1rem"}}>Criadero La Miel</p>

            {alertInfo.visible && (
              <Alert color={alertInfo.color} isOpen={alertInfo.visible} toggle={() => setAlertInfo({ ...alertInfo, visible: false })} fade={false}>
                {alertInfo.message}
              </Alert>
            )}

            <Form onSubmit={handleLogin}>
              <FormGroup>
                <Label for="username" className="form-label">Usuario</Label>
                <Input
                  type="text"
                  id="username"
                  bsSize="sm" // Input un poco más pequeño
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  required
                  disabled={isLoading}
                  className="form-control"
                />
              </FormGroup>

              <FormGroup>
                <Label for="password" className="form-label">Contraseña</Label>
                <Input
                  type="password"
                  id="password"
                  bsSize="sm" // Input un poco más pequeño
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  disabled={isLoading}
                  className="form-control"
                />
              </FormGroup>

              <Button color="primary" type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2"/> Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </Form>

          </CardBody>
        </Card>
      </div> {/* Fin Mitad Formulario */}

    </div> // Fin Contenedor Principal
  );
};

export default Login;