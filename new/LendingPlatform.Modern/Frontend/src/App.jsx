import React, { useState } from 'react';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Users from './pages/Users';
import Loans from './pages/Loans';
import Fines from './pages/Fines';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotificationsPage from './pages/Notifications';

import './index.css';

const App = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('library_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoggedIn, setIsLoggedIn] = useState(!!user);
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedItemId, setSelectedItemId] = useState(null);

    const navigateTo = (view, id = null) => {
        setCurrentView(view);
        setSelectedItemId(id);
    };

    const handleLogin = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('library_user', JSON.stringify(userData));
    };

    const handleRegister = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('library_user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('library_user');
        setAuthView('login');
        setCurrentView('dashboard');
    };

    if (!isLoggedIn) {
        if (authView === 'register') {
            return <Register onRegister={handleRegister} onShowLogin={() => setAuthView('login')} />;
        }
        return <Login onLogin={handleLogin} onShowRegister={() => setAuthView('register')} />;
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard onNavigate={navigateTo} />;
            case 'books':
                return <Books selectedId={selectedItemId} onClearSelection={() => setSelectedItemId(null)} />;
            case 'users':
                return <Users selectedId={selectedItemId} onClearSelection={() => setSelectedItemId(null)} />;
            case 'loans':
                return <Loans />;
            case 'fines':
                return <Fines />;
            case 'profile':
                return <Profile />;
            case 'settings':
                return <Settings />;
            case 'notifications':
                return <NotificationsPage />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <AppLayout currentView={currentView} setCurrentView={navigateTo} onLogout={handleLogout}>
            {renderContent()}
        </AppLayout>
    );
};

export default App;
