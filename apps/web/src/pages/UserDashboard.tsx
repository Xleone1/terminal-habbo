import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout } from '../api/authApi';
import { getUserProfile, getUserInventory, getUserRooms, InventoryItem, Room } from '../api/userApi';
import { User } from '../store/authStore';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { token, user, logout: logoutStore } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    (async () => {
      try {
        const [p, i, r] = await Promise.all([
          getUserProfile(token), getUserInventory(token), getUserRooms(token),
        ]);
        setProfile(p.user);
        setInventory(i.inventory);
        setRooms(r.rooms);
      } catch (e) { /* */ }
      setLoading(false);
    })();
  }, [token, navigate]);

  const handleLogout = async () => {
    try { await logout(token!); } catch (_) {}
    logoutStore();
    navigate('/');
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vapor-grey)' }}>Cargando panel…</div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">TERMINAL</div>
          <nav className="nav" style={{ gap: 12 }}>
            <a href="#perfil" className="text-hazard" style={{ color: 'var(--hazard-cyan)', fontSize: 12 }}>PERFIL</a>
            <a href="#inventario" style={{ color: 'var(--vapor-grey)', fontSize: 12 }}>INVENTARIO</a>
            <a href="#salas" style={{ color: 'var(--vapor-grey)', fontSize: 12 }}>SALAS</a>
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
          <div>© Retro — Terminal</div>
          <div className="links"><span>Panel de usuario</span></div>
        </div>
      </footer>
    </div>
  );
}
