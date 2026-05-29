import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/authApi';
import {
  getAdminUsers,
  getAdminRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  deleteUser,
  toggleUserRole,
  CreateRoomPayload,
} from '../../api/adminApi';
import { User } from '../../store/authStore';
import { Room } from '../../api/userApi';
import '../../styles/pages.css';
import './admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, user, logout: logoutStore, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'rooms'>('users');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [newRoom, setNewRoom] = useState<CreateRoomPayload>({
    name: '',
    description: '',
    capacity: 50,
    is_public: true,
  });

  useEffect(() => {
    if (!token || !isAdmin()) {
      navigate('/');
      return;
    }

    fetchAdminData();
  }, [token, navigate, isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, roomsData] = await Promise.all([
        getAdminUsers(token!),
        getAdminRooms(token!),
      ]);

      setUsers(usersData.users);
      setRooms(roomsData.rooms);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(token!);
    } catch (err) {
      // Ignore error
    } finally {
      logoutStore();
      navigate('/');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await deleteUser(token!, userId);
      setUsers(users.filter((u) => u.id !== userId));
      alert('Usuario eliminado');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleRole = async (userId: number) => {
    try {
      const result = await toggleUserRole(token!, userId);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: result.user.role } : u))
      );
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name) {
      alert('El nombre de la sala es requerido');
      return;
    }

    try {
      const result = await createRoom(token!, newRoom);
      setRooms([...rooms, result.room]);
      setNewRoom({ name: '', description: '', capacity: 50, is_public: true });
      setShowRoomForm(false);
      alert('Sala creada');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta sala?')) {
      return;
    }

    try {
      await deleteRoom(token!, roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
      alert('Sala eliminada');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Cargando panel administrativo...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">PANEL ADMINISTRATIVO</h1>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {error && <div style={{ color: '#fca5a5', marginBottom: '20px' }}>Error: {error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Gestionar Usuarios ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          Gestionar Salas ({rooms.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2 className="section-title">Usuarios</h2>
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
                      <td>{u.id}</td>
                      <td className="user-name">{u.username}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </td>
                      <td>{new Date(u.created_at || '').toLocaleDateString('es-ES')}</td>
                      <td className="actions">
                        <button
                          className="action-btn toggle"
                          onClick={() => handleToggleRole(u.id)}
                          title="Cambiar rol"
                        >
                          👤
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="section-title">Salas</h2>
              <button
                className="cta-btn primary"
                onClick={() => setShowRoomForm(!showRoomForm)}
              >
                {showRoomForm ? 'Cancelar' : '+ Nueva Sala'}
              </button>
            </div>

            {showRoomForm && (
              <form onSubmit={handleCreateRoom} className="room-form">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="Nombre de la sala"
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Capacidad</label>
                    <input
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newRoom.is_public}
                        onChange={(e) => setNewRoom({ ...newRoom, is_public: e.target.checked })}
                      />
                      Pública
                    </label>
                  </div>
                </div>
                <button type="submit" className="submit-btn">Crear Sala</button>
              </form>
            )}

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Capacidad</th>
                    <th>Usuarios</th>
                    <th>Pública</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td className="room-name">{r.name}</td>
                      <td>{r.description?.substring(0, 30)}...</td>
                      <td>{r.capacity}</td>
                      <td>{r.current_users}</td>
                      <td>{r.is_public ? '✓' : '✗'}</td>
                      <td className="actions">
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteRoom(r.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
