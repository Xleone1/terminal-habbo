import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { useAuthStore } from '../store/authStore';
import { login, register } from '../api/authApi';
import { getStats, Statistics } from '../api/statsApi';

export default function Landing() {
  const navigate = useNavigate();
  const { setToken, setUser, isAuthenticated, user } = useAuthStore();
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regMsg, setRegMsg] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) { /* silent */ }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser || !loginPass) {
      setLoginMsg('Completa ambos campos');
      return;
    }
    setLoginLoading(true);
    setLoginMsg('');
    try {
      const res = await login(loginUser, loginPass);
      setToken(res.token);
      setUser(res.user);
      setLoginMsg('Acceso concedido');
      setTimeout(() => {
        navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
      }, 600);
    } catch (err: any) {
      setLoginMsg(err.message || 'Credenciales inválidas');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUser || !regPass) {
      setRegMsg('Completa todos los campos');
      return;
    }
    if (regPass.length < 6) {
      setRegMsg('Contraseña: mínimo 6 caracteres');
      return;
    }
    setRegLoading(true);
    setRegMsg('');
    try {
      await register(regUser, regPass);
      setRegMsg('Registro exitoso. Ahora puedes iniciar sesión.');
      setRegUser('');
      setRegPass('');
    } catch (err: any) {
      setRegMsg(err.message || 'Error al registrarse');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="landing-root">
      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">TERMINAL</div>
          <nav className="nav">
            <a href="#inicio">INICIO</a>
            <a href="#noticias">NOTICIAS</a>
            <a href="#comunidad">COMUNIDAD</a>
            <a href="#info">INFO</a>
          </nav>
          <div className="actions">
            {isAuthenticated ? (
              <button
                className="btn primary"
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
              >
                Panel
              </button>
            ) : (
              <>
                <button className="btn ghost" onClick={() => document.getElementById('login-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                  Entrar
                </button>
                <button className="btn primary" onClick={() => document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="inicio" className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <h1 className="display">ENTRA. NO TODO LO VISIBLE ESTÁ VACÍO.</h1>
              <p className="lede">Un hotel que sigue existiendo cuando te vas. Eventos, placas y una comunidad que no necesita gustos populares.</p>

              <form id="register-form" className="register-form" onSubmit={handleRegister}>
                <label>
                  <span className="label-meta">Usuario</span>
                  <input
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder="tuusuario"
                  />
                </label>
                <label>
                  <span className="label-meta">Contraseña</span>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
                {regMsg && <p className={`micro ${regMsg.includes('exitosa') ? 'text-sodium' : ''}`} style={{ color: regMsg.includes('exitosa') ? 'var(--dead-green)' : undefined }}>{regMsg}</p>}
                <div className="form-actions">
                  <button className="btn primary" type="submit" disabled={regLoading}>
                    {regLoading ? 'Sincronizando…' : 'Únete ahora'}
                  </button>
                  <button className="btn ghost" type="button">Más info</button>
                </div>
                <p className="micro">Al registrarte recibes una placa de bienvenida. Nada más ostentoso.</p>
              </form>
            </div>

            {/* Login Box */}
            <aside className="login-box" id="login-box">
              <div className="panel-top">
                <span className="telemetry">/auth</span>
                <hr className="horizon" />
              </div>
              <form className="login-form" onSubmit={handleLogin}>
                <label>
                  <span className="label-meta">Usuario</span>
                  <input
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="usuario"
                  />
                </label>
                <label>
                  <span className="label-meta">Contraseña</span>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
                {loginMsg && <p className="micro" style={{ color: loginMsg === 'Acceso concedido' ? 'var(--dead-green)' : undefined }}>{loginMsg}</p>}
                <div className="form-actions">
                  <button className="btn primary" type="submit" disabled={loginLoading}>
                    {loginLoading ? 'Verificando…' : 'Entrar'}
                  </button>
                </div>
              </form>
              <div className="panel-bottom">
                <span className="metadata">último acceso: {isAuthenticated ? 'Activo' : 'N/A'}</span>
              </div>
            </aside>
          </div>
          <svg className="atmos-horizon" viewBox="0 0 1200 2" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="1" x2="1200" y2="1" stroke="var(--sodium-fog)" strokeWidth="0.8" opacity="0.7" />
          </svg>
        </section>

        {/* News */}
        <section id="noticias" className="news">
          <div className="section-inner">
            <h2 className="section-title">NOTICIAS</h2>
            <div className="news-grid">
              <article className="news-item">
                <div className="thumb" aria-hidden="true" />
                <div className="news-body">
                  <time className="meta">2026-05-29</time>
                  <h3>Evento: Primavera de Placas</h3>
                  <p className="excerpt">Nuevas placas y minijuegos. El hotel sincronizará recompensas en la madrugada.</p>
                </div>
              </article>
              <article className="news-item">
                <div className="thumb small" aria-hidden="true" />
                <div className="news-body">
                  <time className="meta">2026-05-20</time>
                  <h3>Mantenimiento programado</h3>
                  <p className="excerpt">Se aplicarán parches y optimizaciones. El servicio puede verse intermitente.</p>
                </div>
              </article>
              <article className="news-item">
                <div className="thumb" aria-hidden="true" />
                <div className="news-body">
                  <time className="meta">2026-04-10</time>
                  <h3>Campeonato de Arquitectura</h3>
                  <p className="excerpt">Inscripciones abiertas. Construye una sala que importe.</p>
                </div>
              </article>
            </div>
            <div className="more-link"><a href="#comunidad">Ver todas las noticias →</a></div>
          </div>
        </section>

        {/* Community + Stats */}
        <section id="comunidad" className="community">
          <div className="section-inner">
            <h2 className="section-title">COMUNIDAD</h2>
            <div className="community-grid">
              <div className="community-stream">
                <div className="post">
                  <div className="p-meta"><span className="telemetry">#342</span> <span className="author">Admin</span> <time>hace 2h</time></div>
                  <div className="p-body">Se ha desplegado una nueva placa por asistencia. No te sorprendas si la encuentras en tu inventario.</div>
                </div>
                <div className="post">
                  <div className="p-meta"><span className="telemetry">#317</span> <span className="author">EventBot</span> <time>ayer</time></div>
                  <div className="p-body">Próximo minijuego: sincronización de canales. No traigas expectación.</div>
                </div>
                <div className="post">
                  <div className="p-meta"><span className="telemetry">#301</span> <span className="author">Hotel</span> <time>hace 3d</time></div>
                  <div className="p-body">Nuevas salas públicas disponibles. La Recepción Principal ha sido renovada.</div>
                </div>
              </div>
              <aside className="community-sidebar">
                <div className="panel">
                  <h4 className="small">Jugadores conectados</h4>
                  <div className="stat">{stats?.stats?.players_online ?? '--'}</div>
                  <hr className="horizon" />
                  <h4 className="small">Salas activas</h4>
                  <div className="stat" style={{ fontSize: 18 }}>{stats?.stats?.active_rooms ?? '--'}</div>
                  <hr className="horizon" />
                  <h4 className="small">Usuarios registrados</h4>
                  <div className="stat" style={{ fontSize: 18 }}>{stats?.stats?.total_users ?? '--'}</div>
                </div>
              </aside>
            </div>
            {/* Top 10 users */}
            {stats?.recent_users && stats.recent_users.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 className="small" style={{ color: 'var(--vapor-grey)', marginBottom: 8 }}>Últimos usuarios conectados</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {stats.recent_users.slice(0, 10).map((u) => (
                    <span key={u.id} style={{
                      padding: '4px 10px',
                      border: '1px solid rgba(255,255,255,0.04)',
                      fontSize: 12,
                      color: u.role === 'admin' ? 'var(--sodium-fog)' : 'var(--frost-bloom)',
                      background: 'rgba(27,31,36,0.3)'
                    }}>
                      {u.username}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Info */}
        <section id="info" className="info">
          <div className="section-inner">
            <h2 className="section-title">SISTEMA</h2>
            <p className="muted">Este portal es una terminal de acceso. Operaciones observadas y registros conservados.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>© Retro — Terminal</div>
          <div className="links"><a href="#">Soporte</a> <a href="#">Reglas</a></div>
        </div>
      </footer>
    </div>
  );
}
