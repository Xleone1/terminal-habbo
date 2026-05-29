import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/authApi';
import {
  getAdminUsers, getAdminRooms, createRoom, deleteRoom, deleteUser, toggleUserRole,
} from '../../api/adminApi';
import { User } from '../../store/authStore';
import { Room } from '../../api/userApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, user, logout: logoutStore, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'rooms'>('users');
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomCap, setRoomCap] = useState(50);
  const [roomPublic, setRoomPublic] = useState(true);

  useEffect(() => {
    if (!token || !isAdmin()) { navigate('/'); return; }
    fetchData();
  }, [token, navigate, isAdmin]);

  const fetchData = async () => {
    try {
      const [u, r] = await Promise.all([getAdminUsers(token!), getAdminRooms(token!)]);
      setUsers(u.users);
      setRooms(r.rooms);
    } catch (_) {}
    setLoading(false);
  };

  const handleLogout = async () => {
    try { await logout(token!); } catch (_) {}
    logoutStore();
    navigate('/');
  };

  const handleToggleRole = async (userId: number) => {
    try {
      const result = await toggleUserRole(token!, userId);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: result.user.role } : u)));
    } catch (_) {}
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await deleteUser(token!, userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (_) {}
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName) return;
    try {
      const result = await createRoom(token!, { name: roomName, description: roomDesc, capacity: roomCap, is_public: roomPublic });
      setRooms([...rooms, result.room]);
      setRoomName(''); setRoomDesc(''); setRoomCap(50); setRoomPublic(true); setShowForm(false);
    } catch (_) {}
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('¿Eliminar esta sala?')) return;
    try {
      await deleteRoom(token!, roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (_) {}
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vapor-grey)' }}>Cargando panel…</div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">TERMINAL</div>
          <nav className="nav">
            <span className="telemetry">/admin</span>
          </nav>
          <div className="actions">
            <span className="micro">{user?.username} <span className="badge admin">ADMIN</span></span>
            <button className="btn ghost" onClick={handleLogout}>Salir</button>
          </div>
        </div>
      </header>

      <div className="section-inner">
        <h2 className="section-title">PANEL ADMINISTRATIVO</h2>

        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Usuarios ({users.length})
          </button>
          <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            Salas ({rooms.length})
          </button>
        </div>

        {activeTab === 'users' && (
          <div>
            <h4 className="small" style={{ color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
              Gestión de usuarios
            </h4>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Registrado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--vapor-grey)', fontSize: 11 }}>{u.id}</td>
                      <td style={{ fontWeight: 500 }}>{u.username}</td>
                      <td><span className={`badge ${u.role}`}>{u.role === 'admin' ? 'Admin' : 'User'}</span></td>
                      <td className="meta">{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}</td>
                      <td>
                        <button className="action-btn" onClick={() => handleToggleRole(u.id)} title="Alternar rol">Rol</button>
                        <button className="action-btn danger" onClick={() => handleDeleteUser(u.id)} title="Eliminar">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 className="small" style={{ color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>
                Gestión de salas
              </h4>
              <button className="btn primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancelar' : '+ Nueva sala'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreateRoom} style={{
                background: 'rgba(27,31,36,0.3)', border: '1px solid rgba(255,255,255,0.03)',
                display: 'grid', gap: 10, padding: 14, marginBottom: 16
              }}>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Nombre</span>
                  <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Nombre de la sala"
                    style={{ background: 'rgba(13,15,17,0.6)', border: '1px solid rgba(255,255,255,0.02)', color: 'var(--frost-bloom)', padding: 8, fontFamily: 'inherit', borderRadius: 2 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Descripción</span>
                  <textarea value={roomDesc} onChange={(e) => setRoomDesc(e.target.value)} placeholder="Descripción"
                    style={{ background: 'rgba(13,15,17,0.6)', border: '1px solid rgba(255,255,255,0.02)', color: 'var(--frost-bloom)', padding: 8, fontFamily: 'inherit', borderRadius: 2, resize: 'vertical', minHeight: 60 }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                    <span className="label-meta">Capacidad</span>
                    <input type="number" value={roomCap} onChange={(e) => setRoomCap(Number(e.target.value))} min={1}
                      style={{ background: 'rgba(13,15,17,0.6)', border: '1px solid rgba(255,255,255,0.02)', color: 'var(--frost-bloom)', padding: 8, fontFamily: 'inherit', borderRadius: 2 }} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, paddingTop: 20 }}>
                    <input type="checkbox" checked={roomPublic} onChange={(e) => setRoomPublic(e.target.checked)} />
                    <span className="label-meta">Sala pública</span>
                  </label>
                </div>
                <div className="form-actions">
                  <button className="btn primary" type="submit">Crear sala</button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Cap</th>
                    <th>Online</th>
                    <th>Pública</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--vapor-grey)', fontSize: 11 }}>{r.id}</td>
                      <td style={{ fontWeight: 500, color: 'var(--sodium-fog)' }}>{r.name}</td>
                      <td className="meta">{r.description?.substring(0, 30) || '—'}</td>
                      <td>{r.capacity}</td>
                      <td>{r.current_users}</td>
                      <td>{r.is_public ? '✓' : '✗'}</td>
                      <td>
                        <button className="action-btn danger" onClick={() => handleDeleteRoom(r.id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>© Retro — Terminal</div>
          <div className="links"><span>Panel administrativo</span></div>
        </div>
      </footer>
    </div>
  );
}
