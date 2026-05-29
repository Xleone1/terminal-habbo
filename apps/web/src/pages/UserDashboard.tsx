import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout } from '../api/authApi';
import { getUserProfile, getUserInventory, getUserRooms, InventoryItem, Room } from '../api/userApi';
import { User } from '../store/authStore';
import '../styles/pages.css';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { token, user, logout: logoutStore } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [token, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileData, inventoryData, roomsData] = await Promise.all([
        getUserProfile(token!),
        getUserInventory(token!),
        getUserRooms(token!),
      ]);

      setProfile(profileData.user);
      setInventory(inventoryData.inventory);
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
      // Ignore error on logout
    } finally {
      logoutStore();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Cargando tu panel...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">MI PANEL</h1>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {error && <div style={{ color: '#fca5a5', marginBottom: '20px' }}>Error: {error}</div>}

      <div className="dashboard-content">
        {/* Profile Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Perfil</h2>
          <div className="profile-card">
            <div className="profile-field">
              <span className="profile-label">Usuario:</span>
              <span className="profile-value">{profile?.username}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">ID:</span>
              <span className="profile-value">{profile?.id}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Rol:</span>
              <span className="profile-value">
                {profile?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Miembro desde:</span>
              <span className="profile-value">
                {profile && new Date(profile.created_at || '').toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Inventario</h2>
          {inventory.length === 0 ? (
            <div className="profile-card empty-state">
              <div className="empty-state-icon">📦</div>
              <p>Tu inventario está vacío</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {inventory.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-name">{item.item.name}</div>
                  <div className="item-description">{item.item.description}</div>
                  <div className="item-quantity">
                    Cantidad: <strong>{item.quantity}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rooms Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Mis Salas</h2>
          {rooms.length === 0 ? (
            <div className="profile-card empty-state">
              <div className="empty-state-icon">🏠</div>
              <p>No tienes salas propias</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-name">{room.name}</div>
                  <div className="room-description">{room.description}</div>
                  <div className="room-info">
                    👥 {room.current_users}/{room.capacity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
