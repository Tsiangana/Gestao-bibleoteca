import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, Search, CheckCircle, Clock, X, ChevronDown } from 'lucide-react';
import { api } from '../api';
import LoanModal from '../components/LoanModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [returnConfirm, setReturnConfirm] = useState({ isOpen: false, loan: null });

    // Search & filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Active' | 'Returned'
    const filterRef = useRef(null);

    useEffect(() => {
        fetchLoans();
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterPanel(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const data = await api.get('/loans');
            // Sort newest first by default (highest id = most recent)
            data.sort((a, b) => b.id - a.id);
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

    const processReturn = async () => {
        const loan = returnConfirm.loan;
        if (!loan) return;
        setReturnConfirm({ isOpen: false, loan: null });
        try {
            await api.put(`/loans/${loan.id}/return`);
            fetchLoans();
        } catch (err) {
            alert('Erro ao processar devolução');
            console.error(err);
        }
    };

    // --- Filtering & Sorting ---

    let displayedLoans = [...loans];

    // 1. Search filter
    if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        displayedLoans = displayedLoans.filter(l =>
            l.userName?.toLowerCase().includes(q) ||
            l.bookTitle?.toLowerCase().includes(q) ||
            String(l.id).includes(q)
        );
    }

    // 2. Status filter panel
    if (statusFilter !== 'all') {
        displayedLoans = displayedLoans.filter(l => l.status === statusFilter);
    }

    // 3. "Ver Atrasados" toggle — overrides everything, sorts by most overdue first
    if (showOverdueOnly) {
        displayedLoans = displayedLoans
            .filter(l => l.isOverdue && l.status !== 'Returned')
            .sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0));
    }

    // --- UI helpers ---

    const overdueCount = loans.filter(l => l.isOverdue && l.status !== 'Returned').length;

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

            <ConfirmationModal
                isOpen={returnConfirm.isOpen}
                title="Confirmar Devolução"
                message={returnConfirm.loan ? `Confirma a devolução do livro "${returnConfirm.loan.bookTitle}" pelo utilizador ${returnConfirm.loan.userName}?` : ''}
                confirmText="Confirmar Devolução"
                cancelText="Cancelar"
                onConfirm={processReturn}
                onCancel={() => setReturnConfirm({ isOpen: false, loan: null })}
                type="info"
            />

            <div className="table-container">
                <div className="table-header">
                    {/* Search bar */}
                    <div className="search-bar" style={{ width: '350px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Buscar por usuário, livro ou ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                        {/* Ver Atrasados toggle */}
                        <button
                            className={showOverdueOnly ? 'btn btn-primary' : 'btn btn-secondary'}
                            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
                            onClick={() => setShowOverdueOnly(v => !v)}
                        >
                            <Clock size={16} />
                            Ver Atrasados
                            {overdueCount > 0 && (
                                <span style={{
                                    backgroundColor: showOverdueOnly ? 'white' : 'var(--danger)',
                                    color: showOverdueOnly ? 'var(--danger)' : 'white',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    marginLeft: '2px'
                                }}>
                                    {overdueCount}
                                </span>
                            )}
                        </button>

                        {/* Filtros dropdown */}
                        <div ref={filterRef} style={{ position: 'relative' }}>
                            <button
                                className={statusFilter !== 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
                                style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => setShowFilterPanel(v => !v)}
                            >
                                <Filter size={16} />
                                Filtros
                                {statusFilter !== 'all' && <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>• {statusFilter === 'Active' ? 'Ativos' : 'Devolvidos'}</span>}
                                <ChevronDown size={14} style={{ transform: showFilterPanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            {showFilterPanel && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 6px)',
                                    right: 0,
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                                    border: '1px solid var(--border-color)',
                                    zIndex: 200,
                                    minWidth: '200px',
                                    padding: '0.75rem',
                                    overflow: 'hidden'
                                }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
                                        Estado do Empréstimo
                                    </p>
                                    {[
                                        { value: 'all', label: 'Todos os estados' },
                                        { value: 'Active', label: 'Activos' },
                                        { value: 'Returned', label: 'Devolvidos' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setStatusFilter(opt.value); setShowFilterPanel(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                width: '100%',
                                                padding: '0.625rem 0.75rem',
                                                border: 'none',
                                                borderRadius: '8px',
                                                background: statusFilter === opt.value ? '#EFF6FF' : 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: statusFilter === opt.value ? 600 : 400,
                                                color: statusFilter === opt.value ? 'var(--primary)' : 'var(--text-main)',
                                                textAlign: 'left',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => { if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = 'var(--bg-main)'; }}
                                            onMouseLeave={e => { if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                                backgroundColor: opt.value === 'Active' ? 'var(--primary)' : opt.value === 'Returned' ? 'var(--success)' : 'var(--text-secondary)'
                                            }} />
                                            {opt.label}
                                        </button>
                                    ))}

                                    {statusFilter !== 'all' && (
                                        <button
                                            onClick={() => { setStatusFilter('all'); setShowFilterPanel(false); }}
                                            style={{
                                                marginTop: '0.5rem',
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                background: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                color: 'var(--danger)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <X size={12} /> Limpar filtro
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active filter indicators */}
                {(showOverdueOnly || statusFilter !== 'all' || searchTerm) && (
                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', backgroundColor: '#FAFAFA' }}>
                        {showOverdueOnly && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Clock size={11} /> Somente atrasados
                                <button onClick={() => setShowOverdueOnly(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', padding: '0 2px', display: 'flex', alignItems: 'center' }}><X size={11} /></button>
                            </span>
                        )}
                        {statusFilter !== 'all' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#DBEAFE', color: 'var(--primary)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Filter size={11} /> {statusFilter === 'Active' ? 'Ativos' : 'Devolvidos'}
                                <button onClick={() => setStatusFilter('all')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0 2px', display: 'flex', alignItems: 'center' }}><X size={11} /></button>
                            </span>
                        )}
                        {searchTerm && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#F3F4F6', color: 'var(--text-main)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Search size={11} /> "{searchTerm}"
                                <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0 2px', display: 'flex', alignItems: 'center' }}><X size={11} /></button>
                            </span>
                        )}
                    </div>
                )}

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>ID</th>
                            <th>Utilizador</th>
                            <th>Livro</th>
                            <th>Data Limite</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedLoans.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                                    {showOverdueOnly
                                        ? '✅ Nenhum empréstimo em atraso!'
                                        : 'Nenhum empréstimo encontrado.'}
                                </td>
                            </tr>
                        ) : (
                            displayedLoans.map(loan => (
                                <tr key={loan.id} style={{ backgroundColor: loan.isOverdue && loan.status !== 'Returned' ? 'var(--danger-bg)' : 'transparent' }}>
                                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>#{loan.id}</td>
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
                                                onClick={() => setReturnConfirm({ isOpen: true, loan })}
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
