import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreVertical, Mail, Phone } from 'lucide-react';
import { api } from '../api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin': return <span className="badge" style={{ backgroundColor: '#4F46E5', color: 'white' }}>Admin</span>;
            case 'Librarian': return <span className="badge" style={{ backgroundColor: '#0EA5E9', color: 'white' }}>Bibliotecário</span>;
            case 'Professor': return <span className="badge" style={{ backgroundColor: '#8B5CF6', color: 'white' }}>Professor</span>;
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
                <button className="btn btn-primary">
                    <Plus size={16} /> Novo Usuário
                </button>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <div className="search-bar" style={{ width: '300px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input type="text" placeholder="Nome, email ou matrícula..." />
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                        <Filter size={16} /> Filtros
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}><input type="checkbox" /></th>
                            <th>Usuário</th>
                            <th>Contato</th>
                            <th>Tipo</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum usuário encontrado.</td></tr>
                        ) : (
                            users.map(user => (
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
                                                    {user.studentNumber ? `Matrícula: ${user.studentNumber}` : 'Equipe / Docente'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <Mail size={14} color="var(--text-secondary)" /> {user.email || 'N/A'}
                                        </div>
                                    </td>
                                    <td>{getRoleBadge(user.role)}</td>
                                    <td>{getStatusBadge(user.status)}</td>
                                    <td>
                                        <button className="action-icon" style={{ padding: '0.5rem' }}>
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
