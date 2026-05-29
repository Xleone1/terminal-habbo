import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/authApi';
import {
  getAdminUsers, getAdminRooms, createRoom, deleteRoom, deleteUser, toggleUserRole,
  getAdminItems, createItem, addInventoryItem, Item,
} from '../../api/adminApi';
import {
  getAdminPosts, createPost, deletePost, Post, CreatePostPayload,
} from '../../api/postsApi';
import { User } from '../../store/authStore';
import { Room } from '../../api/userApi';

type Tab = 'users' | 'rooms' | 'news' | 'community' | 'inventory';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, user, logout: logoutStore, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [loading, setLoading] = useState(true);

  // Room form
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomCap, setRoomCap] = useState(50);
  const [roomPublic, setRoomPublic] = useState(true);

  // Post form
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postAuthor, setPostAuthor] = useState('');

  // Inventory form
  const [invUserId, setInvUserId] = useState<number | ''>('');
  const [invItemId, setInvItemId] = useState<number | ''>('');
  const [invQty, setInvQty] = useState(1);
  const [invMsg, setInvMsg] = useState('');

  // Item creation form
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemPrice, setItemPrice] = useState(0);

  useEffect(() => {
    if (!token || !isAdmin()) { navigate('/'); return; }
    fetchData();
  }, [token, navigate, isAdmin]);

  const fetchData = async () => {
    try {
      const [u, r, p, i] = await Promise.all([
        getAdminUsers(token!), getAdminRooms(token!), getAdminPosts(token!), getAdminItems(token!),
      ]);
      setUsers(u.users);
      setRooms(r.rooms);
      setPosts(p.posts);
      setItems(i.items);
    } catch (_) {}
    setLoading(false);
  };

  const handleLogout = async () => {
    try { await logout(token!); } catch (_) {}
    logoutStore();
    navigate('/');
  };

  // User actions
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

  // Room actions
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName) return;
    try {
      const result = await createRoom(token!, { name: roomName, description: roomDesc, capacity: roomCap, is_public: roomPublic });
      setRooms([...rooms, result.room]);
      setRoomName(''); setRoomDesc(''); setRoomCap(50); setRoomPublic(true); setShowRoomForm(false);
    } catch (_) {}
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('¿Eliminar esta sala?')) return;
    try {
      await deleteRoom(token!, roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (_) {}
  };

  // Post actions
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent) return;
    const postType = activeTab === 'news' ? 'news' : 'community';
    const payload: CreatePostPayload = {
      type: postType,
      content: postContent,
      author: postAuthor || user?.username || 'Admin',
      image_url: postImageUrl || undefined,
    };
    if (postType === 'news') {
      payload.title = postTitle;
      payload.excerpt = postExcerpt;
    }
    try {
      const result = await createPost(token!, payload);
      setPosts([result.post, ...posts]);
      setPostTitle(''); setPostContent(''); setPostExcerpt(''); setPostImageUrl(''); setPostAuthor('');
      setShowPostForm(false);
    } catch (_) {}
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    try {
      await deletePost(token!, postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (_) {}
  };

  // Inventory actions
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invUserId || !invItemId) { setInvMsg('Selecciona usuario e item'); return; }
    try {
      await addInventoryItem(token!, { user_id: Number(invUserId), item_id: Number(invItemId), quantity: invQty });
      setInvMsg('Item agregado exitosamente');
      setInvUserId(''); setInvItemId(''); setInvQty(1);
    } catch (_) { setInvMsg('Error al agregar item'); }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemType) return;
    try {
      const result = await createItem(token!, { name: itemName, description: itemDesc, type: itemType, price: itemPrice });
      setItems([...items, result.item]);
      setItemName(''); setItemDesc(''); setItemType(''); setItemPrice(0); setShowItemForm(false);
    } catch (_) {}
  };

  const filteredPosts = posts.filter((p) => p.type === activeTab);

  const inputStyle = {
    background: 'rgba(13,15,17,0.6)', border: '1px solid rgba(255,255,255,0.02)',
    color: 'var(--frost-bloom)', padding: 8, fontFamily: 'inherit', borderRadius: 2, width: '100%' as const,
  };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vapor-grey)' }}>Cargando panel…</div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">Hotel.exe</div>
          <nav className="nav">
            <span className="telemetry">/admin</span>
            <button className="btn ghost" onClick={() => navigate('/dashboard')} style={{ fontSize: 11, padding: '4px 10px' }}>Dashboard</button>
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
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Usuarios</button>
          <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Salas</button>
          <button className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>Noticias</button>
          <button className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>Comunidad</button>
          <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => { setActiveTab('inventory'); setInvMsg(''); }}>Inventario</button>
        </div>

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            <h4 className="small" style={{ color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>Gestión de usuarios</h4>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Usuario</th><th>Rol</th><th>Registrado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--vapor-grey)', fontSize: 11 }}>{u.id}</td>
                      <td style={{ fontWeight: 500 }}>{u.username}</td>
                      <td><span className={`badge ${u.role}`}>{u.role === 'admin' ? 'Admin' : 'User'}</span></td>
                      <td className="meta">{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}</td>
                      <td>
                        <button className="action-btn" onClick={() => handleToggleRole(u.id)}>Rol</button>
                        <button className="action-btn danger" onClick={() => handleDeleteUser(u.id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rooms tab */}
        {activeTab === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 className="small" style={{ color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>Gestión de salas</h4>
              <button className="btn primary" onClick={() => setShowRoomForm(!showRoomForm)}>{showRoomForm ? 'Cancelar' : '+ Nueva sala'}</button>
            </div>
            {showRoomForm && (
              <form onSubmit={handleCreateRoom} style={{ background: 'rgba(27,31,36,0.3)', border: '1px solid rgba(255,255,255,0.03)', display: 'grid', gap: 10, padding: 14, marginBottom: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Nombre</span>
                  <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Nombre de la sala" style={inputStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Descripción</span>
                  <textarea value={roomDesc} onChange={(e) => setRoomDesc(e.target.value)} placeholder="Descripción" style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                    <span className="label-meta">Capacidad</span>
                    <input type="number" value={roomCap} onChange={(e) => setRoomCap(Number(e.target.value))} min={1} style={inputStyle} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, paddingTop: 20 }}>
                    <input type="checkbox" checked={roomPublic} onChange={(e) => setRoomPublic(e.target.checked)} />
                    <span className="label-meta">Sala pública</span>
                  </label>
                </div>
                <div className="form-actions"><button className="btn primary" type="submit">Crear sala</button></div>
              </form>
            )}
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Cap</th><th>Online</th><th>Pública</th><th>Acciones</th></tr>
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
                      <td><button className="action-btn danger" onClick={() => handleDeleteRoom(r.id)}>Del</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* News & Community tabs */}
        {(activeTab === 'news' || activeTab === 'community') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 className="small" style={{ color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>
                {activeTab === 'news' ? 'Noticias' : 'Publicaciones de comunidad'}
              </h4>
              <button className="btn primary" onClick={() => { setShowPostForm(!showPostForm); setPostAuthor(user?.username || 'Admin'); }}>
                {showPostForm ? 'Cancelar' : '+ Nueva'}
              </button>
            </div>

            {showPostForm && (
              <form onSubmit={handleCreatePost} style={{ background: 'rgba(27,31,36,0.3)', border: '1px solid rgba(255,255,255,0.03)', display: 'grid', gap: 10, padding: 14, marginBottom: 16 }}>
                {activeTab === 'news' && (
                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                    <span className="label-meta">Título</span>
                    <input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Título de la noticia" style={inputStyle} />
                  </label>
                )}
                {activeTab === 'news' && (
                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                    <span className="label-meta">Extracto</span>
                    <input value={postExcerpt} onChange={(e) => setPostExcerpt(e.target.value)} placeholder="Breve resumen" style={inputStyle} />
                  </label>
                )}
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Contenido</span>
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Escribe el contenido aquí…" style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} required />
                </label>
                {activeTab === 'news' && (
                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                    <span className="label-meta">URL de imagen</span>
                    <input value={postImageUrl} onChange={(e) => setPostImageUrl(e.target.value)} placeholder="https://ejemplo.com/imagen.png" style={inputStyle} />
                  </label>
                )}
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Autor</span>
                  <input value={postAuthor} onChange={(e) => setPostAuthor(e.target.value)} placeholder="Autor" style={inputStyle} />
                </label>
                <div className="form-actions"><button className="btn primary" type="submit">Publicar</button></div>
              </form>
            )}

            {filteredPosts.length === 0 ? (
              <p className="muted">No hay {activeTab === 'news' ? 'noticias' : 'publicaciones'} todavía.</p>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      {activeTab === 'news' && <th>Título</th>}
                      <th>Contenido</th>
                      <th>Autor</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--vapor-grey)', fontSize: 11 }}>{p.id}</td>
                        {activeTab === 'news' && <td style={{ fontWeight: 500, color: 'var(--sodium-fog)' }}>{p.title || '—'}</td>}
                        <td className="meta">{p.content.substring(0, 60)}{p.content.length > 60 ? '…' : ''}</td>
                        <td style={{ color: 'var(--dead-green)' }}>{p.author}</td>
                        <td className="meta">{p.published_at ? new Date(p.published_at).toLocaleDateString('es-ES') : '—'}</td>
                        <td><button className="action-btn danger" onClick={() => handleDeletePost(p.id)}>Del</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Inventory tab */}
        {activeTab === 'inventory' && (
          <div>
            <h4 className="small" style={{ color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>Agregar item a usuario</h4>
            <form onSubmit={handleAddInventory} style={{ background: 'rgba(27,31,36,0.3)', border: '1px solid rgba(255,255,255,0.03)', display: 'grid', gap: 10, padding: 14, marginBottom: 16 }}>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                <span className="label-meta">Usuario</span>
                <select value={invUserId} onChange={(e) => setInvUserId(e.target.value ? Number(e.target.value) : '')} style={selectStyle}>
                  <option value="">Seleccionar usuario…</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                <span className="label-meta">Item</span>
                <select value={invItemId} onChange={(e) => setInvItemId(e.target.value ? Number(e.target.value) : '')} style={selectStyle}>
                  <option value="">Seleccionar item…</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.type})</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                <span className="label-meta">Cantidad</span>
                <input type="number" value={invQty} onChange={(e) => setInvQty(Math.max(1, Number(e.target.value)))} min={1} style={inputStyle} />
              </label>
              {invMsg && <p className="micro" style={{ color: invMsg.includes('exitosa') ? 'var(--dead-green)' : undefined }}>{invMsg}</p>}
              <div className="form-actions"><button className="btn primary" type="submit">Agregar al inventario</button></div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
              <h4 className="small" style={{ color: 'var(--vapor-grey)', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>Items disponibles</h4>
              <button className="btn primary" onClick={() => setShowItemForm(!showItemForm)}>{showItemForm ? 'Cancelar' : '+ Nuevo item'}</button>
            </div>

            {showItemForm && (
              <form onSubmit={handleCreateItem} style={{ background: 'rgba(27,31,36,0.3)', border: '1px solid rgba(255,255,255,0.03)', display: 'grid', gap: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                    <span className="label-meta">Nombre</span>
                    <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Nombre del item" style={inputStyle} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                    <span className="label-meta">Tipo</span>
                    <input value={itemType} onChange={(e) => setItemType(e.target.value)} placeholder="ej: mueble, placa, wall" style={inputStyle} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Descripción</span>
                  <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Descripción" style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                  <span className="label-meta">Precio</span>
                  <input type="number" value={itemPrice} onChange={(e) => setItemPrice(Number(e.target.value))} min={0} style={inputStyle} />
                </label>
                <div className="form-actions"><button className="btn primary" type="submit">Crear item</button></div>
              </form>
            )}

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Descripción</th><th>Precio</th></tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td style={{ color: 'var(--vapor-grey)', fontSize: 11 }}>{i.id}</td>
                      <td style={{ fontWeight: 500, color: 'var(--sodium-fog)' }}>{i.name}</td>
                      <td><span className="badge">{i.type}</span></td>
                      <td className="meta">{i.description?.substring(0, 40) || '—'}</td>
                      <td>{i.price > 0 ? `${i.price} créditos` : 'Gratis'}</td>
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
          <div>© Hotel.exe — Terminal</div>
          <div className="links"><span>Panel administrativo</span></div>
        </div>
      </footer>
    </div>
  );
}
