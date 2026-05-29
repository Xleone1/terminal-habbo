import React, { useState, useEffect } from 'react';
import { getStats, Statistics } from '../../api/statsApi';
import './landing.css';

export default function Stats() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-container loading">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="stats-container error">Error: {error}</div>;
  }

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Jugadores En Línea</div>
          <div className="stat-value">{stats?.stats.players_online || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Salas Activas</div>
          <div className="stat-value">{stats?.stats.active_rooms || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total de Salas</div>
          <div className="stat-value">{stats?.stats.total_rooms || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Usuarios Registrados</div>
          <div className="stat-value">{stats?.stats.total_users || 0}</div>
        </div>
      </div>

      <div className="recent-users">
        <h3>Últimos Usuarios Conectados</h3>
        <ul className="users-list">
          {stats?.recent_users?.slice(0, 10).map((user) => (
            <li key={user.id}>
              <span className="username">{user.username}</span>
              <span className={`role ${user.role}`}>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
