import React, { useState, useEffect } from 'react';
import { X, Book, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../api';

const UserHistoryModal = ({ user, onClose }) => {
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/users/${user.id}/history`);
            setHistory(data);
        } catch (err) {
            console.error('Erro ao carregar histórico', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{
                width: '90%', maxWidth: '800px', maxHeight: '90vh',
                overflowY: 'auto', padding: '1.5rem', position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
                }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                        {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{user.fullName}</h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{user.studentNumber || 'Colaborador'}</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando histórico...</div>
                ) : history ? (
                    <>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total de Livros</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{history.totalBooksBorrowed}</div>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Empréstimos Ativos</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: history.activeLoansCount >= 3 ? 'var(--danger)' : 'var(--primary)' }}>
                                    {history.activeLoansCount}/3
                                </div>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Multas Pendentes</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: history.totalUnpaidFines > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                    {history.totalUnpaidFines.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                </div>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Status de Empréstimo</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600, color: history.canBorrowMore ? 'var(--success)' : 'var(--danger)' }}>
                                    {history.canBorrowMore ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                    {history.canBorrowMore ? 'Pode Pegar' : 'Bloqueado'}
                                </div>
                            </div>
                        </div>

                        <h3>Histórico de Empréstimos</h3>
                        <div className="table-container" style={{ margin: 0 }}>
                            <table style={{ fontSize: '0.875rem' }}>
                                <thead>
                                    <tr>
                                        <th>Livro</th>
                                        <th>Data Emp.</th>
                                        <th>Exp. Devolução</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.loans.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>Nenhum empréstimo registrado.</td></tr>
                                    ) : (
                                        history.loans.map(loan => (
                                            <tr key={loan.id}>
                                                <td style={{ fontWeight: 500 }}>{loan.bookTitle}</td>
                                                <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                                                <td>{new Date(loan.expectedReturnDate).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${loan.status === 'Active' ? (loan.isOverdue ? 'badge-danger' : 'badge-info') : 'badge-success'}`}>
                                                        {loan.status === 'Active' ? (loan.isOverdue ? 'Atrasado' : 'Ativo') : 'Devolvido'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Erro ao carregar dados.</div>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default UserHistoryModal;
