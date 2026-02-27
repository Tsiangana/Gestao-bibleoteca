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

import './index.css';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'
    const [currentView, setCurrentView] = useState('dashboard');

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleRegister = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
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
                return <Dashboard />;
            case 'books':
                return <Books />;
            case 'users':
                return <Users />;
            case 'loans':
                return <Loans />;
            case 'fines':
                return <Fines />;
            case 'profile':
                return <Profile />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <AppLayout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
            {renderContent()}
        </AppLayout>
    );
};

export default App;
