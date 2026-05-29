import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './landing.css';

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuthStore();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (isAdmin()) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="hero">
      <h1 className="hero-title">TERMINAL DE VIDA SECUNDARIA</h1>
      <p className="hero-subtitle">Retro Hotel - Comunidad de jugadores en línea</p>
      
      <div className="hero-cta">
        {isAuthenticated ? (
          <button onClick={handleDashboardClick} className="cta-btn primary">
            {isAdmin() ? 'Panel Administrativo' : 'Mi Panel'}
          </button>
        ) : (
          <>
            <button onClick={handleLoginClick} className="cta-btn primary">
              Iniciar Sesión
            </button>
            <button onClick={handleLoginClick} className="cta-btn secondary">
              Registrarse
            </button>
          </>
        )}
      </div>
    </div>
  );
}
