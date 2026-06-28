import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout, getSSOTicket } from '../api/authApi';
import { getUserProfile, getUserInventory, getUserRooms, InventoryItem, Room } from '../api/userApi';
import { User } from '../store/authStore';
import { getPosts, Post } from '../api/postsApi';
import HabboAvatar from '../components/HabboAvatar';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { token, user, logout: logoutStore } = useAuthStore();
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
        setNewsPosts(posts.posts.filter((post) => post.type === 'news').slice(0, 2));
        setCommunityPosts(posts.posts.filter((post) => post.type === 'community').slice(0, 2));
      } catch (e) { /* */ }
      setLoading(false);
    })();
  }, [token, navigate]);

  const handleLogout = async () => {
    try { await logout(token!); } catch (_) {}
    logoutStore();
    navigate('/');
  };

  const card = {
    background: 'linear-gradient(180deg, rgba(17,19,21,0.2), rgba(17,19,21,0.08))',
    border: '1px solid rgba(255,255,255,0.02)',
    padding: 12,
  } as const;

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vapor-grey)' }}>Cargando panel…</div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">Hotel.exe</div>
          <nav className="nav" style={{ gap: 16 }}>
            <a href="#inventario" style={{ color: 'var(--hazard-cyan)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>INVENTARIO</a>
            <a href="#salas" style={{ color: 'var(--vapor-grey)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>SALAS</a>
            <a href="#social" style={{ color: 'var(--vapor-grey)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>SOCIAL</a>
            {profile?.role === 'admin' && (
              <a href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
                style={{ color: 'var(--sodium-fog)', fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>
                ADMIN
              </a>
            )}
          </nav>
          <div className="actions">
            <span className="micro" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HabboAvatar size={32} />
              {profile?.username}{profile?.role === 'admin' ? <span style={{ marginLeft: 4, color: 'var(--sodium-fog)', fontSize: 10 }}>ADMIN</span> : null}
            </span>
            <button className="btn ghost" onClick={handleLogout}>Salir</button>
          </div>
        </div>
      </header>

      <div className="section-inner">

        {/* Welcome + Enter Hotel */}
        <section style={{ marginBottom: 36, padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <HabboAvatar size={56} />
            <div>
              <div style={{ fontSize: 14, color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono", monospace' }}>
                <span style={{ color: 'var(--sodium-fog)' }}>&gt;</span> sesión iniciada como <span style={{ color: 'var(--frost-bloom)' }}>{profile?.username}</span>
              </div>
              <div className="micro" style={{ marginTop: 2 }}>
                {profile?.role === 'admin' ? 'Administrador' : 'Usuario'} · ID:{profile?.id}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={async () => {
                if (!token) return;
                try {
                  const res = await getSSOTicket(token);
                  localStorage.setItem('sso.ticket', res.ticket);
                  window.location.href = 'https://play.xcleone.me';
                } catch (e: any) {
                  alert(e.message || 'Error al obtener ticket SSO');
                }
              }}
              style={{
                background: 'linear-gradient(180deg, rgba(217,143,59,0.15), rgba(217,143,59,0.06))',
                border: '1px solid rgba(217,143,59,0.2)',
                color: 'var(--sodium-fog)',
                padding: '12px 40px',
                fontSize: 14,
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
            <p className="micro" style={{ marginTop: 6, color: 'var(--vapor-grey)' }}>Conéctate al servidor del hotel</p>
          </div>
        </section>

        {/* Primary: Inventory + Rooms side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>
          <section id="inventario">
            <h2 className="section-title">Inventario</h2>
            {inventory.length === 0 ? (
              <p className="muted">Tu inventario está vacío.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {inventory.map((item) => (
                  <div key={item.id} style={card}>
                    <div style={{ color: 'var(--frost-bloom)', fontWeight: 500, fontSize: 13 }}>{item.item.name}</div>
                    <div className="micro" style={{ marginTop: 2 }}>{item.item.description}</div>
                    <div className="micro" style={{ marginTop: 4, color: 'var(--sodium-fog)' }}>x{item.quantity}</div>
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
              <div style={{ display: 'grid', gap: 10 }}>
                {rooms.map((room) => (
                  <div key={room.id} style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--sodium-fog)', fontWeight: 500, fontSize: 14 }}>{room.name}</div>
                      <span className="micro" style={{ color: 'var(--vapor-grey)' }}>{room.current_users}/{room.capacity}</span>
                    </div>
                    <div className="micro" style={{ marginTop: 4 }}>{room.description}</div>
                    <div className="micro" style={{ marginTop: 6 }}>
                      {room.is_public ? <span style={{ color: 'var(--dead-green)' }}>Pública</span> : <span style={{ color: 'var(--vapor-grey)' }}>Privada</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Secondary: News + Community side by side */}
        <section id="social" style={{ marginBottom: 36 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Social</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h4 className="small" style={{ color: 'var(--vapor-grey)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: '"IBM Plex Mono",monospace' }}>Últimas Noticias</h4>
              {newsPosts.length === 0 ? (
                <p className="muted" style={{ fontSize: 12 }}>No hay noticias recientes.</p>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {newsPosts.map((post) => (
                    <div key={post.id} style={{ display: 'flex', gap: 10, ...card }}>
                      {post.image_url ? (
                        <div style={{
                          width: 56, minHeight: 44, flexShrink: 0,
                          backgroundImage: `url(${post.image_url})`,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          border: '1px solid rgba(255,255,255,0.02)',
                        }} />
                      ) : (
                        <div style={{
                          width: 56, minHeight: 44, flexShrink: 0,
                          background: 'linear-gradient(90deg, rgba(13,15,17,0.6), rgba(27,31,36,0.4))',
                          border: '1px solid rgba(255,255,255,0.02)',
                        }} />
                      )}
                      <div>
                        <div className="meta" style={{ fontSize: 10 }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('es-ES') : ''}</div>
                        <div style={{ color: 'var(--frost-bloom)', fontWeight: 500, fontSize: 13 }}>{post.title || 'Sin título'}</div>
                        <div className="micro" style={{ fontSize: 11 }}>{post.excerpt || post.content.substring(0, 60)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="small" style={{ color: 'var(--vapor-grey)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: '"IBM Plex Mono",monospace' }}>Comunidad</h4>
              {communityPosts.length === 0 ? (
                <p className="muted" style={{ fontSize: 12 }}>No hay publicaciones recientes.</p>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {communityPosts.map((post) => (
                    <div key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: 8 }}>
                      <div className="micro" style={{ marginBottom: 2, color: 'var(--vapor-grey)', fontSize: 11 }}>
                        <span style={{ color: 'var(--dead-green)' }}>{post.author}</span> — {post.published_at ? new Date(post.published_at).toLocaleDateString('es-ES') : ''}
                      </div>
                      <div style={{ color: 'var(--frost-bloom)', fontSize: 13, lineHeight: 1.4 }}>{post.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
