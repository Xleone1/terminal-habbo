import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout } from '../api/authApi';
import { getUserProfile, getUserInventory, getUserRooms, InventoryItem, Room } from '../api/userApi';
import { User } from '../store/authStore';
import { getPosts, Post } from '../api/postsApi';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { token, user, logout: logoutStore, isAdmin } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newsPosts, setNewsPosts] = useState<Post[]>([]);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    (async () => {
      try {
        const [p, i, r, posts] = await Promise.all([
          getUserProfile(token), getUserInventory(token), getUserRooms(token), getPosts(),
        ]);
        setProfile(p.user);
        setInventory(i.inventory);
        setRooms(r.rooms);
        setNewsPosts(posts.posts.filter((post) => post.type === 'news').slice(0, 3));
        setCommunityPosts(posts.posts.filter((post) => post.type === 'community').slice(0, 3));
      } catch (e) { /* */ }
      setLoading(false);
    })();
  }, [token, navigate]);

  const handleLogout = async () => {
    try { await logout(token!); } catch (_) {}
    logoutStore();
    navigate('/');
  };

  const navLink = (label: string, href: string, color: string) => (
    <a href={href} style={{ color, fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</a>
  );

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vapor-grey)' }}>Cargando panel…</div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">Hotel.exe</div>
          <nav className="nav" style={{ gap: 16 }}>
            <a href="#perfil" style={{ color: 'var(--hazard-cyan)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>PERFIL</a>
            <a href="#inventario" style={{ color: 'var(--vapor-grey)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>INVENTARIO</a>
            <a href="#salas" style={{ color: 'var(--vapor-grey)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>SALAS</a>
            {profile?.role === 'admin' && (
              <a href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
                style={{ color: 'var(--sodium-fog)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>
                ADMIN
              </a>
            )}
          </nav>
          <div className="actions">
            <span className="micro" style={{ display: 'flex', alignItems: 'center' }}>
              {profile?.username}{profile?.role === 'admin' ? <span style={{ marginLeft: 6, color: 'var(--sodium-fog)', fontSize: 10 }}>ADMIN</span> : null}
            </span>
            <button className="btn ghost" onClick={handleLogout}>Salir</button>
          </div>
        </div>
      </header>

      <div className="section-inner">
        {/* Mock Enter Hotel button */}
        <section style={{ marginBottom: 40, textAlign: 'center', padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
          <button
            onClick={() => alert('Hotel.exe — Modo demostración. Conéctate mediante el emulador.')}
            style={{
              background: 'linear-gradient(180deg, rgba(217,143,59,0.15), rgba(217,143,59,0.06))',
              border: '1px solid rgba(217,143,59,0.2)',
              color: 'var(--sodium-fog)',
              padding: '14px 48px',
              fontSize: 16,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(180deg, rgba(217,143,59,0.25), rgba(217,143,59,0.1))'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(180deg, rgba(217,143,59,0.15), rgba(217,143,59,0.06))'; }}
          >
            Entrar al hotel
          </button>
          <p className="micro" style={{ marginTop: 8, color: 'var(--vapor-grey)' }}>Modo demostración — Emulador no conectado</p>
        </section>

        <section id="perfil" style={{ marginBottom: 40 }}>
          <h2 className="section-title">Perfil</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              ['Usuario', profile?.username],
              ['Rol', profile?.role === 'admin' ? 'Administrador' : 'Usuario'],
              ['ID', profile?.id],
              ['Miembro desde', profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES') : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{
                background: 'linear-gradient(180deg, rgba(17,19,21,0.2), rgba(17,19,21,0.08))',
                border: '1px solid rgba(255,255,255,0.02)', padding: 12
              }}>
                <div style={{ fontSize: 11, color: 'var(--vapor-grey)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <div style={{ color: 'var(--frost-bloom)', fontSize: 14, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* News dashboard section */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title">Últimas Noticias</h2>
          {newsPosts.length === 0 ? (
            <p className="muted">No hay noticias recientes.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {newsPosts.map((post) => (
                <div key={post.id} style={{
                  background: 'linear-gradient(180deg, rgba(17,19,21,0.2), rgba(17,19,21,0.08))',
                  border: '1px solid rgba(255,255,255,0.02)', padding: 12
                }}>
                  <div className="meta" style={{ fontSize: 11, marginBottom: 4 }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('es-ES') : new Date(post.created_at).toLocaleDateString('es-ES')}</div>
                  <div style={{ color: 'var(--frost-bloom)', fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{post.title || 'Sin título'}</div>
                  <div className="micro">{post.excerpt || post.content.substring(0, 80)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Community dashboard section */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title">Comunidad</h2>
          {communityPosts.length === 0 ? (
            <p className="muted">No hay publicaciones recientes.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {communityPosts.map((post) => (
                <div key={post.id} style={{
                  borderTop: '1px solid rgba(255,255,255,0.02)', padding: '10px 0'
                }}>
                  <div className="micro" style={{ marginBottom: 4, color: 'var(--vapor-grey)' }}>
                    <span style={{ color: 'var(--dead-green)' }}>{post.author}</span> — {post.published_at ? new Date(post.published_at).toLocaleDateString('es-ES') : ''}
                  </div>
                  <div style={{ color: 'var(--frost-bloom)', fontSize: 14 }}>{post.content}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="inventario" style={{ marginBottom: 40 }}>
          <h2 className="section-title">Inventario</h2>
          {inventory.length === 0 ? (
            <p className="muted">Tu inventario está vacío.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {inventory.map((item) => (
                <div key={item.id} style={{
                  background: 'linear-gradient(180deg, rgba(17,19,21,0.2), rgba(17,19,21,0.08))',
                  border: '1px solid rgba(255,255,255,0.02)', padding: 12
                }}>
                  <div style={{ color: 'var(--frost-bloom)', fontWeight: 500, fontSize: 14 }}>{item.item.name}</div>
                  <div className="micro" style={{ marginTop: 4 }}>{item.item.description}</div>
                  <div className="micro" style={{ marginTop: 6, color: 'var(--sodium-fog)' }}>x{item.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="salas">
          <h2 className="section-title">Mis Salas</h2>
          {rooms.length === 0 ? (
            <p className="muted">No tienes salas propias.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {rooms.map((room) => (
                <div key={room.id} style={{
                  background: 'linear-gradient(180deg, rgba(17,19,21,0.2), rgba(17,19,21,0.08))',
                  border: '1px solid rgba(255,255,255,0.02)', padding: 12
                }}>
                  <div style={{ color: 'var(--sodium-fog)', fontWeight: 500, fontSize: 14 }}>{room.name}</div>
                  <div className="micro" style={{ marginTop: 4 }}>{room.description}</div>
                  <div className="micro" style={{ marginTop: 6 }}>{room.current_users}/{room.capacity}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>© Hotel.exe — Terminal</div>
          <div className="links"><span>Panel de usuario</span></div>
        </div>
      </footer>
    </div>
  );
}
