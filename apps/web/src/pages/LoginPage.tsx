import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login, register } from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (!username || !password) {
      setMsg('Completa todos los campos');
      return;
    }
    if (mode === 'register') {
      if (password.length < 6) {
        setMsg('Contraseña: mínimo 6 caracteres');
        return;
      }
      if (password !== confirm) {
        setMsg('Las contraseñas no coinciden');
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(username, password);
        setToken(res.token);
        setUser(res.user);
        setTimeout(() => navigate(res.user.role === 'admin' ? '/admin' : '/dashboard'), 300);
      } else {
        await register(username, password);
        setMsg('Registro exitoso. Ahora inicia sesión.');
        setMode('login');
      }
    } catch (err: any) {
      setMsg(err.message || 'Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
          <button
            onClick={() => { setMode('login'); setMsg(''); }}
            style={{
              flex: 1, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.04)',
              background: mode === 'login' ? 'rgba(217,143,59,0.08)' : 'transparent',
              color: mode === 'login' ? 'var(--sodium-fog)' : 'var(--vapor-grey)',
              fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: 1
            }}
          >Iniciar sesión</button>
          <button
            onClick={() => { setMode('register'); setMsg(''); }}
            style={{
              flex: 1, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.04)',
              background: mode === 'register' ? 'rgba(217,143,59,0.08)' : 'transparent',
              color: mode === 'register' ? 'var(--sodium-fog)' : 'var(--vapor-grey)',
              fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: 1
            }}
          >Registrarse</button>
        </div>

        <div style={{
          background: 'linear-gradient(180deg, rgba(27,31,36,0.6), rgba(11,12,14,0.4))',
          border: '1px solid rgba(255,255,255,0.03)', padding: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="telemetry">/auth</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
              <span className="label-meta">Usuario</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tuusuario"
                style={{
                  background: 'rgba(13,15,17,0.6)', border: '1px solid rgba(255,255,255,0.02)',
                  color: 'var(--frost-bloom)', padding: 8, fontFamily: 'inherit', borderRadius: 2
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
              <span className="label-meta">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'rgba(13,15,17,0.6)', border: '1px solid rgba(255,255,255,0.02)',
                  color: 'var(--frost-bloom)', padding: 8, fontFamily: 'inherit', borderRadius: 2
                }}
              />
            </label>
            {mode === 'register' && (
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                <span className="label-meta">Confirmar contraseña</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    background: 'rgba(13,15,17,0.6)', border: '1px solid rgba(255,255,255,0.02)',
                    color: 'var(--frost-bloom)', padding: 8, fontFamily: 'inherit', borderRadius: 2
                  }}
                />
              </label>
            )}
            {msg ? (
              <p className="micro" style={{ color: msg.includes('exitosa') || msg.includes('inicia sesión') ? 'var(--dead-green)' : undefined }}>
                {msg}
              </p>
            ) : null}
            <div className="form-actions">
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? (mode === 'login' ? 'Verificando…' : 'Sincronizando…') : (mode === 'login' ? 'Entrar' : 'Registrarse')}
              </button>
              <button className="btn ghost" type="button" onClick={() => navigate('/')}>Volver</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
