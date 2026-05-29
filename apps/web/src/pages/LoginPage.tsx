import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/pages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  return (
    <div className="login-page">
      <div className="container">
        {showRegister ? (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginForm
            onSuccess={handleLoginSuccess}
          />
        )}

        {!showRegister && (
          <div className="register-prompt">
            <p>¿No tienes cuenta?</p>
            <button onClick={() => setShowRegister(true)}>
              Regístrate ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
