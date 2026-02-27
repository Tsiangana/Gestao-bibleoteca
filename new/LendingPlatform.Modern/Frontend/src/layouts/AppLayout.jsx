import React, { useState } from 'react';
import { LayoutDashboard, Book, Users, Clock, AlertTriangle, Settings, Bell, Search, LogOut, User } from 'lucide-react';

const AppLayout = ({ children, currentView, setCurrentView, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Livro Atrasado', message: 'Carlos Bloqueado não devolveu "Clean Code".', type: 'danger', time: '2h atrás' },
    { id: 2, title: 'Nova Reserva', message: 'Maria solicitou "Dom Casmurro".', type: 'info', time: '5h atrás' },
    { id: 3, title: 'Multa Paga', message: 'João Silva pagou a multa de R$ 4,00.', type: 'success', time: 'Ontem' },
  ];

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
          <div className="search-bar">
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Buscar livros, usuários, empréstimos..." />
          </div>

          <div className="topbar-actions">
            <div style={{ position: 'relative' }}>
              <div
                className="action-icon"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ cursor: 'pointer', backgroundColor: showNotifications ? 'var(--bg-main)' : 'transparent' }}
              >
                <Bell size={20} />
                <div className="notification-dot"></div>
              </div>

              {showNotifications && (
                <div className="card" style={{ position: 'absolute', top: '50px', right: 0, width: '320px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 0 }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Notificações</span>
                    <button style={{ fontSize: '0.75rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }}>Limpar tudo</button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', backgroundColor: n.type === 'danger' ? 'var(--danger)' : n.type === 'success' ? 'var(--success)' : 'var(--primary)' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                          <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                    <button style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', border: 'none', background: 'none' }}>Ver todas as notificações</button>
                  </div>
                </div>
              )}
            </div>

            <div
              className="user-profile"
              onClick={() => setCurrentView('profile')}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar">AD</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Admin</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bibliotecário Chefe</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
