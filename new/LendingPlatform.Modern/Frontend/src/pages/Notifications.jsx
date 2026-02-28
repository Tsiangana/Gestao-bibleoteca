import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, Clock, AlertCircle, Info, ChevronRight, Search, Filter } from 'lucide-react';
import { api } from '../api';
import ConfirmationModal from '../components/ConfirmationModal';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await api.get('/notifications');
            setNotifications(data || []);
        } catch (err) {
            console.error('Erro ao buscar notificações:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Erro ao marcar como lida:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error('Erro ao deletar notificação:', err);
        }
    };

    const handleClearConfirm = async () => {
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setIsClearModalOpen(false);
        } catch (err) {
            console.error('Erro ao limpar notificações:', err);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'danger': return <AlertCircle size={20} color="var(--danger)" />;
            case 'success': return <CheckCircle size={20} color="var(--success)" />;
            case 'warning': return <Clock size={20} color="var(--warning)" />;
            default: return <Info size={20} color="var(--primary)" />;
        }
    };

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2>Central de Notificações</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Gerencie todos os alertas e atividades do sistema.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => setIsClearModalOpen(true)} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={16} /> Limpar Tudo
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isClearModalOpen}
                title="Limpar Notificações"
                message="Tem certeza que deseja apagar permanentemente todas as suas notificações? Esta ação não pode ser desfeita."
                confirmText="Limpar Todas"
                onConfirm={handleClearConfirm}
                onCancel={() => setIsClearModalOpen(false)}
            />

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F9FAFB'
                }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                border: 'none', background: 'none', fontSize: '0.875rem', fontWeight: filter === 'all' ? 700 : 500,
                                color: filter === 'all' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer'
                            }}
                        >
                            Todas ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            style={{
                                border: 'none', background: 'none', fontSize: '0.875rem', fontWeight: filter === 'unread' ? 700 : 500,
                                color: filter === 'unread' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer'
                            }}
                        >
                            Não lidas ({notifications.filter(n => !n.isRead).length})
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredNotifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '50%', marginBottom: '1rem' }}>
                                <Bell size={32} color="#9CA3AF" />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>Nenhuma notificação</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Você está em dia com todos os alertas do sistema.</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                style={{
                                    padding: '1.25rem 1.5rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    gap: '1rem',
                                    backgroundColor: notification.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.03)',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                <div style={{ marginTop: '2px' }}>
                                    {getTypeIcon(notification.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                                            {notification.title}
                                            {!notification.isRead && (
                                                <span style={{
                                                    display: 'inline-block', width: '8px', height: '8px',
                                                    backgroundColor: 'var(--primary)', borderRadius: '50%',
                                                    marginLeft: '8px', verticalAlign: 'middle'
                                                }}></span>
                                            )}
                                        </h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(notification.createdAt).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                                        {notification.message}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                                        {!notification.isRead && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                                style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                            >
                                                Marcar como lida
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                            style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
