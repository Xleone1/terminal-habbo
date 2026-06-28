import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { useAuthStore } from '../store/authStore';
import { login, register, getSSOTicket } from '../api/authApi';
import { getStats, Statistics } from '../api/statsApi';
import { getPosts, Post } from '../api/postsApi';

export default function Landing() {
  const navigate = useNavigate();
  const { setToken, setUser, isAuthenticated, user, token } = useAuthStore();
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regMsg, setRegMsg] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [stats, setStats] = useState<Statistics | null>(null);
  const [news, setNews] = useState<Post[]>([]);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [s, p] = await Promise.all([getStats(), getPosts()]);
      setStats(s);
      setNews(p.posts.filter((post) => post.type === 'news'));
      setCommunityPosts(p.posts.filter((post) => post.type === 'community'));
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
      navigate('/dashboard', { replace: true });
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
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">Hotel.exe</div>
          <nav className="nav">
            <a href="#inicio">INICIO</a>
            <a href="#noticias">NOTICIAS</a>
            <a href="#comunidad">COMUNIDAD</a>
            <a href="#info">INFO</a>
          </nav>
          <div className="actions">
            {isAuthenticated ? (
              <>
                <button
                  className="btn primary"
                  onClick={async () => {
                    try {
                      const res = await getSSOTicket(token!);
                      localStorage.setItem('sso.ticket', res.ticket);
                      window.location.href = 'https://play.xcleone.me';
                    } catch (e: any) {
                      alert(e.message || 'Error al obtener ticket SSO');
                    }
                  }}
                >
                  Entrar al hotel
                </button>
                <button className="btn ghost" onClick={() => navigate('/dashboard')}>
                  Panel
                </button>
              </>
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
        {/* Stats bar — top of page */}
        <section className="stats-bar">
          <div className="stats-bar-inner">
            <div className="stat-chip">
              <span className="stat-label">Jugadores</span>
              <span className="stat-value">{stats?.stats?.players_online ?? '--'}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Salas activas</span>
              <span className="stat-value">{stats?.stats?.active_rooms ?? '--'}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Registrados</span>
              <span className="stat-value">{stats?.stats?.total_users ?? '--'}</span>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section id="inicio" className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <h1 className="display">ENTRA. NO TODO LO VISIBLE ESTÁ VACÍO.</h1>
              <p className="lede">Un hotel que sigue existiendo cuando te vas. Eventos, placas y una comunidad que no necesita gustos populares.</p>

              <form id="register-form" className="register-form" onSubmit={handleRegister}>
                <label>
                  <span className="label-meta">Usuario</span>
                  <input value={regUser} onChange={(e) => setRegUser(e.target.value)} placeholder="tuusuario" />
                </label>
                <label>
                  <span className="label-meta">Contraseña</span>
                  <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="••••••••" />
                </label>
                {regMsg && <p className={`micro ${regMsg.includes('exitosa') ? 'text-sodium' : ''}`} style={{ color: regMsg.includes('exitosa') ? 'var(--dead-green)' : undefined }}>{regMsg}</p>}
                <div className="form-actions">
                  <button className="btn primary" type="submit" disabled={regLoading}>{regLoading ? 'Sincronizando…' : 'Únete ahora'}</button>
                  <button className="btn ghost" type="button">Más info</button>
                </div>
                <p className="micro">Al registrarte recibes una placa de bienvenida. Nada más ostentoso.</p>
              </form>
            </div>

            <aside className="login-box" id="login-box">
              <div className="panel-top">
                <span className="telemetry">/auth</span>
                <hr className="horizon" />
              </div>
              <form className="login-form" onSubmit={handleLogin}>
                <label>
                  <span className="label-meta">Usuario</span>
                  <input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} placeholder="usuario" />
                </label>
                <label>
                  <span className="label-meta">Contraseña</span>
                  <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••••" />
                </label>
                {loginMsg && <p className="micro">{loginMsg}</p>}
                <div className="form-actions">
                  <button className="btn primary" type="submit" disabled={loginLoading}>{loginLoading ? 'Verificando…' : 'Entrar'}</button>
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
              {news.length > 0 ? news.slice(0, 3).map((item) => (
                <article key={item.id} className="news-item">
                  {item.image_url ? (
                    <div className="thumb-img" style={{ backgroundImage: `url(${item.image_url})` }} aria-hidden="true" />
                  ) : (
                    <div className="thumb" aria-hidden="true" />
                  )}
                  <div className="news-body">
                    <time className="meta">{item.published_at ? new Date(item.published_at).toLocaleDateString('es-ES') : new Date(item.created_at).toLocaleDateString('es-ES')}</time>
                    <h3>{item.title || 'Sin título'}</h3>
                    <p className="excerpt">{item.excerpt || item.content.substring(0, 80)}</p>
                  </div>
                </article>
              )) : <>
                <article className="news-item">
                  <div className="thumb" aria-hidden="true" />
                  <div className="news-body">
                    <time className="meta">—</time>
                    <h3>Sin noticias aún</h3>
                    <p className="excerpt">No hay noticias publicadas. Vuelve más tarde.</p>
                  </div>
                </article>
              </>}
            </div>
          </div>
        </section>

        {/* Community + Stats */}
        <section id="comunidad" className="community">
          <div className="section-inner">
            <h2 className="section-title">COMUNIDAD</h2>
            <div className="community-grid">
              <div className="community-stream">
                {communityPosts.length > 0 ? communityPosts.slice(0, 5).map((post, i) => (
                  <div key={post.id} className="post">
                    <div className="p-meta">
                      <span className="telemetry">#{String(post.id).padStart(3, '0')}</span>
                      <span className="author">{post.author}</span>
                      <time>{post.published_at ? (() => { const d = new Date(post.published_at); const n = new Date(); const diff = Math.floor((n.getTime() - d.getTime()) / (1000 * 60 * 60)); return diff < 1 ? 'hace minutos' : diff < 24 ? `hace ${diff}h` : `hace ${Math.floor(diff / 24)}d`; })() : '—'}</time>
                    </div>
                    <div className="p-body">{post.content}</div>
                  </div>
                )) : (
                  <div className="post">
                    <div className="p-meta"><span className="telemetry">#001</span> <span className="author">Hotel</span> <time>—</time></div>
                    <div className="p-body">Bienvenido a la comunidad. Pronto habrá novedades.</div>
                  </div>
                )}
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
                {stats?.recent_users && stats.recent_users.length > 0 && (
                  <div className="panel" style={{ marginTop: 12 }}>
                    <h4 className="small">Últimos usuarios</h4>
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {stats.recent_users.slice(0, 5).map((u) => (
                        <span key={u.id} style={{
                          padding: '2px 8px', border: '1px solid rgba(255,255,255,0.04)',
                          fontSize: 11, color: u.role === 'admin' ? 'var(--sodium-fog)' : 'var(--frost-bloom)',
                        }}>{u.username}</span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
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
          <div>© Hotel.exe — Terminal</div>
          <div className="links"><a href="#">Soporte</a> <a href="#">Reglas</a></div>
        </div>
      </footer>
    </div>
  );
}
