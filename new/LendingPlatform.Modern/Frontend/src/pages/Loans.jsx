import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, CheckCircle, Clock } from 'lucide-react';
import { api } from '../api';

import LoanModal from '../components/LoanModal';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const data = await api.get('/loans');
            setLoans(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar empréstimos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLoan = async (loanData) => {
        try {
            await api.post('/loans', loanData);
            setShowModal(false);
            fetchLoans();
        } catch (err) {
            alert('Erro ao realizar empréstimo. Verifique se o usuário tem multas ou atingiu o limite de 3 livros.');
            console.error(err);
        }
    };

    const processReturn = async (id) => {
        try {
            await api.put(`/loans/${id}/return`);
            alert('Livro devolvido com sucesso!');
            fetchLoans(); // Refresh
        } catch (err) {
            alert('Erro ao processar devolução');
            console.error(err);
        }
    };

    const getStatusBadge = (loan) => {
        if (loan.status === 'Returned') return <span className="badge badge-success">Devolvido</span>;
        if (loan.isOverdue) return <span className="badge badge-danger">Atrasado ({loan.daysOverdue} dias)</span>;
        return <span className="badge badge-info">Ativo</span>;
    };

    const calculateDateStr = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando empréstimos...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Empréstimos e Devoluções</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Acompanhe o fluxo de livros e gerencie prazos.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Novo Empréstimo
                </button>
            </div>

            {showModal && (
                <LoanModal
                    onClose={() => setShowModal(false)}
                    onSave={handleCreateLoan}
                />
            )}

            <div className="table-container">
                <div className="table-header">
                    <div className="search-bar" style={{ width: '350px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input type="text" placeholder="Buscar por usuário, livro ou ID..." />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} /> Ver Atrasados
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                            <Filter size={16} /> Filtros
                        </button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>ID</th>
                            <th>Usuário</th>
                            <th>Livro</th>
                            <th>Data Limite</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum empréstimo encontrado.</td></tr>
                        ) : (
                            loans.map(loan => (
                                <tr key={loan.id} style={{ backgroundColor: loan.isOverdue && loan.status !== 'Returned' ? 'var(--danger-bg)' : 'transparent' }}>
                                    <td style={{ color: 'var(--text-secondary)' }}>#{loan.id}</td>
                                    <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{loan.userName}</td>
                                    <td>{loan.bookTitle}</td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>
                                            {calculateDateStr(loan.expectedReturnDate)}
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(loan)}</td>
                                    <td>
                                        {loan.status === 'Active' || loan.status === 'Overdue' ? (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                onClick={() => processReturn(loan.id)}
                                            >
                                                <CheckCircle size={14} /> Receber
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Devolvido em {calculateDateStr(loan.actualReturnDate)}
                                            </span>
                                        )}
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

export default Loans;
