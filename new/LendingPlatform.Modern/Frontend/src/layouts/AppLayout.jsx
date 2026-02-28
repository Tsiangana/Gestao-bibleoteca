import React, { useState } from 'react';
import { LayoutDashboard, Book, Users, Clock, AlertTriangle, Settings, Bell, Search, LogOut, User, BookOpen, ChevronRight } from 'lucide-react';
import { api } from '../api';
import ConfirmationModal from '../components/ConfirmationModal';

const AppLayout = ({ children, currentView, setCurrentView, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ books: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Read logged-in user from localStorage
  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('library_user') || '{}'); }
    catch { return {}; }
  }, []);

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'US';

  const getRoleLabel = (role) => {
    const map = { Admin: 'Administrador', Student: 'gestor', Professor: 'gestor', Librarian: 'gestor' };
    return map[role] || role || 'Utilizador';
  };

  React.useEffect(() => {
    fetchNotifications();

    // Timer para atualizar notificações ocasionalmente
    const interval = setInterval(fetchNotifications, 60000);

    // Handler para fechar ao clicar fora
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const handleClearConfirm = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setShowNotifications(false);
      setIsClearModalOpen(false);
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    setIsClearModalOpen(true);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.length > 1) {
      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const results = await api.get(`/dashboard/search?q=${q}`);
        setSearchResults(results);
      } catch (err) {
        console.error('Erro na busca:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSearchResults(false);
    }
  };

  const handleResultClick = (view, id) => {
    setCurrentView(view, id);
    setShowSearchResults(false);
    setSearchQuery('');
  };


  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Book size={28} color="var(--primary)" />
          <h2>CSpirita</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }}>
          <button
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            className={`nav-link ${currentView === 'books' ? 'active' : ''}`}
            onClick={() => setCurrentView('books')}
          >
            <Book size={20} /> Acervo
          </button>
          <button
            className={`nav-link ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentView('users')}
          >
            <Users size={20} /> Usuários
          </button>
          <button
            className={`nav-link ${currentView === 'loans' ? 'active' : ''}`}
            onClick={() => setCurrentView('loans')}
          >
            <Clock size={20} /> Empréstimos
          </button>
          <button
            className={`nav-link ${currentView === 'fines' ? 'active' : ''}`}
            onClick={() => setCurrentView('fines')}
          >
            <AlertTriangle size={20} /> Multas
          </button>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button
            className={`nav-link ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            <Settings size={20} /> Configurações
          </button>
          <button
            className="nav-link"
            onClick={onLogout}
            style={{ color: 'var(--danger)' }}
          >
            <LogOut size={20} /> Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <div className="search-bar" style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Buscar livros, usuários..."
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
            />

            {showSearchResults && (
              <div className="card" style={{
                position: 'absolute',
                top: '50px',
                left: 0,
                width: '100%',
                zIndex: 1000,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '0.5rem 0',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {isSearching && (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Buscando...
                  </div>
                )}

                {!isSearching && searchResults.books.length === 0 && searchResults.users.length === 0 && (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Nenhum resultado encontrado.
                  </div>
                )}

                {searchResults.books.length > 0 && (
                  <>
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Livros
                    </div>
                    {searchResults.books.map(book => (
                      <div
                        key={book.id}
                        className="row-hover"
                        onClick={() => handleResultClick('books', book.id)}
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      >
                        <div style={{ padding: '6px', backgroundColor: '#EFF6FF', borderRadius: '6px' }}>
                          <BookOpen size={16} color="var(--primary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{book.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{book.authors}</div>
                        </div>
                        <ChevronRight size={14} color="var(--text-secondary)" />
                      </div>
                    ))}
                  </>
                )}

                {searchResults.users.length > 0 && (
                  <>
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                      Usuários
                    </div>
                    {searchResults.users.map(user => (
                      <div
                        key={user.id}
                        className="row-hover"
                        onClick={() => handleResultClick('users', user.id)}
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      >
                        <div style={{ padding: '6px', backgroundColor: '#F0FDF4', borderRadius: '6px' }}>
                          <User size={16} color="var(--success)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                        <ChevronRight size={14} color="var(--text-secondary)" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="topbar-actions">
            <div style={{ position: 'relative' }} className="notifications-container">
              <div
                className="action-icon"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ cursor: 'pointer', backgroundColor: showNotifications ? 'var(--bg-main)' : 'transparent' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && <div className="notification-dot"></div>}
              </div>

              {showNotifications && (
                <div className="card" style={{ position: 'absolute', top: '50px', right: 0, width: '320px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 0 }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Notificações</span>
                    <button
                      onClick={handleClearAll}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      Limpar tudo
                    </button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Sem notificações no momento.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => setCurrentView('notifications')}
                          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', cursor: 'pointer', backgroundColor: n.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.03)' }}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', backgroundColor: n.type === 'danger' ? 'var(--danger)' : n.type === 'success' ? 'var(--success)' : 'var(--primary)', opacity: n.isRead ? 0.3 : 1 }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {n.title}
                              {!n.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.65rem', cursor: 'pointer' }}
                                >
                                  Marcar lida
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                            <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                    <button
                      onClick={() => { setCurrentView('notifications'); setShowNotifications(false); }}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className="user-profile"
              onClick={() => setCurrentView('profile')}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar">{getInitials(currentUser.fullName)}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {(currentUser.fullName || 'Utilizador').split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {getRoleLabel(currentUser.role)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>
      </div>

      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="Limpar Notificações"
        message="Tem certeza que deseja apagar permanentemente todas as suas notificações? Esta ação não pode ser desfeita."
        confirmText="Limpar Todas"
        onConfirm={handleClearConfirm}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
