import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, Search, MoreVertical, Mail, History, Phone, Edit, Trash2 } from 'lucide-react';
import { api } from '../api';
import UserHistoryModal from '../components/UserHistoryModal';
import UserModal from '../components/UserModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Users = ({ selectedId, onClearSelection }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // Action Menu & Delete States
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        fetchUsers();

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // (filtering logic)
    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.studentNumber && user.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    useEffect(() => {
        if (selectedId && users.length > 0) {
            const user = users.find(u => u.id === selectedId);
            if (user) {
                setSelectedUser(user);
            }
        }
    }, [selectedId, users]);

    const handleCloseHistory = () => {
        setSelectedUser(null);
        if (onClearSelection) onClearSelection();
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get('/users');
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar usuários');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            if (userData.id) {
                await api.put(`/users/${userData.id}`, userData);
            } else {
                await api.post('/users', userData);
            }
            setShowModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            if (err.status === 409) {
                setErrorModal({ isOpen: true, message: err.data?.message || 'Este usuário já existe no sistema.' });
            } else {
                alert('Erro ao salvar usuário.');
            }
            console.error(err);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            if (err.status === 409) {
                setErrorModal({ isOpen: true, message: err.data?.message || 'Erro ao eliminar usuário.' });
            } else {
                alert('Erro ao eliminar usuário.');
            }
            console.error(err);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setShowModal(true);
        setActiveMenuId(null);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
        setActiveMenuId(null);
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin': return <span className="badge" style={{ backgroundColor: '#4F46E5', color: 'white' }}>Admin</span>;
            case 'Professor': return <span className="badge" style={{ backgroundColor: '#8B5CF6', color: 'white' }}>Professor</span>;
            case 'Pessoa Normal': return <span className="badge" style={{ backgroundColor: '#10B981', color: 'white' }}>Pessoa Normal</span>;
            default: return <span className="badge" style={{ backgroundColor: '#E2E8F0', color: '#475569' }}>Estudante</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="badge badge-success">Ativo</span>;
            case 'Suspended': return <span className="badge badge-warning">Suspenso</span>;
            case 'Blocked': return <span className="badge badge-danger">Bloqueado</span>;
            default: return null;
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando usuários...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Gestão de Usuários</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Controle de alunos, professores e equipe técnica.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
                    <Plus size={16} /> Novo Usuário
                </button>
            </div>

            {showModal && (
                <UserModal
                    initialData={editingUser}
                    onClose={() => { setShowModal(false); setEditingUser(null); }}
                    onSave={handleSaveUser}
                />
            )}

            <ConfirmationModal
                isOpen={errorModal.isOpen}
                title="Atenção"
                message={errorModal.message}
                confirmText="Entendido"
                onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
                onCancel={() => setErrorModal({ isOpen: false, message: '' })}
                type="warning"
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o usuário "${userToDelete?.fullName}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDeleteUser}
                onCancel={() => setIsDeleteModalOpen(false)}
                type="danger"
            />

            <div className="table-container">
                <div className="table-header">
                    <div className="search-bar" style={{ width: '350px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email, BI ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}><input type="checkbox" /></th>
                            <th>Usuário</th>
                            <th>BI / Identificação</th>
                            <th>Contato</th>
                            <th>Tipo</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum usuário encontrado.</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="avatar" style={{ backgroundColor: user.status === 'Blocked' ? 'var(--danger)' : 'var(--primary)' }}>
                                                {user.photoUrl ? (
                                                    <img src={user.photoUrl} alt={user.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : getInitials(user.fullName)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{user.fullName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {user.email || 'Sem email cadastrado'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{user.studentNumber || '---'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Número de BI</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <Phone size={14} color="var(--text-secondary)" /> {user.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td>{getRoleBadge(user.role)}</td>
                                    <td>{getStatusBadge(user.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <History size={14} /> Histórico
                                            </button>

                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    className="action-icon"
                                                    style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', background: activeMenuId === user.id ? 'var(--bg-main)' : 'none', cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === user.id ? null : user.id);
                                                    }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {activeMenuId === user.id && (
                                                    <div
                                                        ref={menuRef}
                                                        style={{
                                                            position: 'absolute',
                                                            ...(filteredUsers.indexOf(user) > filteredUsers.length - 4
                                                                ? { bottom: '100%', marginBottom: '-25px' }
                                                                : { top: '100%', marginTop: '-25px' }
                                                            ),
                                                            right: 0,
                                                            backgroundColor: 'white',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                            border: '1px solid var(--border-color)',
                                                            zIndex: 1000,
                                                            minWidth: '200px',
                                                            padding: '0.5rem 0',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <button
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                width: '100%',
                                                                padding: '0.875rem 1.25rem',
                                                                border: 'none',
                                                                background: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                fontWeight: '500',
                                                                color: 'var(--text-main)',
                                                                textAlign: 'left',
                                                                transition: 'all 0.2s',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-main)'; e.currentTarget.style.paddingLeft = '1.5rem'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.paddingLeft = '1.25rem'; }}
                                                            onClick={() => handleEditClick(user)}
                                                        >
                                                            <Edit size={16} color="var(--primary)" />
                                                            Editar Perfil
                                                        </button>
                                                        <button
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                width: '100%',
                                                                padding: '0.875rem 1.25rem',
                                                                border: 'none',
                                                                background: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                fontWeight: '500',
                                                                color: '#DC2626',
                                                                textAlign: 'left',
                                                                transition: 'all 0.2s',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.paddingLeft = '1.5rem'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.paddingLeft = '1.25rem'; }}
                                                            onClick={() => handleDeleteClick(user)}
                                                        >
                                                            <Trash2 size={16} color="#DC2626" />
                                                            Eliminar Usuário
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <UserHistoryModal
                    user={selectedUser}
                    onClose={handleCloseHistory}
                />
            )}
        </div>
    );
};

export default Users;
