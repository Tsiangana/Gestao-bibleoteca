import React, { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle } from 'lucide-react';
import { api } from '../api';

const Fines = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const data = await api.get('/fines');
            setFines(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar multas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const payFine = async (id) => {
        try {
            await api.put(`/fines/${id}/pay`, {});
            alert('Multa paga com sucesso e usuário desbloqueado!');
            fetchFines();
        } catch (err) {
            alert('Erro ao processar pagamento');
            console.error(err);
        }
    };

    const pendingAmount = fines.filter(f => !f.isPaid).reduce((sum, f) => sum + f.amount, 0);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando multas...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Gestão Financeira & Multas</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Acompanhe multas geradas por atraso e pagamentos.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <DollarSign size={20} color="var(--danger)" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600' }}>Receita Pendente</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--danger)' }}>{pendingAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <div className="search-bar" style={{ width: '350px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input type="text" placeholder="Buscar por usuário ou ID..." />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>ID</th>
                            <th>Usuário Cobrado</th>
                            <th>Motivo (Livro Original)</th>
                            <th>Valor (Kz)</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fines.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma multa registrada.</td></tr>
                        ) : (
                            fines.map(fine => (
                                <tr key={fine.id} style={{ opacity: fine.isPaid ? 0.6 : 1 }}>
                                    <td style={{ color: 'var(--text-secondary)' }}>#{fine.id}</td>
                                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{fine.userName}</td>
                                    <td>
                                        <div>{fine.bookTitle || 'Multa Manual / Sistema'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gerada em {new Date(fine.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ fontWeight: '600', color: fine.isPaid ? 'var(--text-secondary)' : 'var(--danger)' }}>
                                        {fine.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                    </td>
                                    <td>
                                        {fine.isPaid ? (
                                            <span className="badge badge-success">Pago</span>
                                        ) : (
                                            <span className="badge badge-danger">Pendente</span>
                                        )}
                                    </td>
                                    <td>
                                        {!fine.isPaid && (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--success)', borderColor: 'var(--success)' }}
                                                onClick={() => payFine(fine.id)}
                                            >
                                                <CheckCircle size={14} /> Registrar Pgto.
                                            </button>
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

export default Fines;
