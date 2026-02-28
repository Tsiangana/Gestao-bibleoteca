import React, { useState, useEffect } from 'react';
import {
    Book, Users, Clock, AlertCircle, AlertTriangle, TrendingUp, ChevronRight,
    Calendar, Download, FileText, Zap, Plus, MoreVertical,
    CheckCircle2, ArrowRight
} from 'lucide-react';
import { api } from '../api';
import ExportModal from '../components/ExportModal';

const Dashboard = ({ onNavigate }) => {
    const [metrics, setMetrics] = useState({
        totalBooks: 0,
        activeLoans: 0,
        activeUsers: 0,
        pendingFinesTotal: 0
    });
    const [topBooks, setTopBooks] = useState([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [m, top, l] = await Promise.all([
                api.get('/dashboard/metrics'),
                api.get('/dashboard/top-books'),
                api.get('/loans')
            ]);
            setMetrics({
                totalBooks: m.totalBooks || m.TotalBooks || 0,
                activeLoans: m.activeLoans || m.ActiveLoans || 0,
                activeUsers: m.activeUsers || m.ActiveUsers || 0,
                pendingFinesTotal: m.pendingFinesTotal || m.PendingFinesTotal || 0
            });
            setTopBooks(top);
            setLoans(l.filter(loan => loan.status !== 'Returned').slice(0, 5));
        } catch (err) {
            console.error('Erro ao carregar dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Sincronizando dados...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Bem-vindo ao Painel, Admin</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.4rem' }}>
                        <Calendar size={14} color="var(--text-secondary)" />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Hoje é {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setShowExportModal(true)}
                    >
                        <FileText size={16} /> Exportar PDF
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
                <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="stat-header">
                        <span className="stat-title">Acervo Total</span>
                        <div style={{ padding: '8px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
                            <Book size={20} color="var(--primary)" />
                        </div>
                    </div>
                    <div className="stat-value">{metrics.totalBooks}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                        <TrendingUp size={14} style={{ marginRight: '4px' }} /> +4.2% catalogados
                    </div>
                </div>

                <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div className="stat-header">
                        <span className="stat-title">Empréstimos Ativos</span>
                        <div style={{ padding: '8px', backgroundColor: '#FFFBEB', borderRadius: '8px' }}>
                            <Clock size={20} color="var(--warning)" />
                        </div>
                    </div>
                    <div className="stat-value">{metrics.activeLoans}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
                        Livros em circulação
                    </div>
                </div>

                <div className="card stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div className="stat-header">
                        <span className="stat-title">Membros Ativos</span>
                        <div style={{ padding: '8px', backgroundColor: '#F0FDF4', borderRadius: '8px' }}>
                            <Users size={20} color="var(--success)" />
                        </div>
                    </div>
                    <div className="stat-value">{metrics.activeUsers}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                        <TrendingUp size={14} style={{ marginRight: '4px' }} /> +12 este mês
                    </div>
                </div>

                <div className="card stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <div className="stat-header">
                        <span className="stat-title">Multas Pendentes</span>
                        <div style={{ padding: '8px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>
                            <AlertTriangle size={20} color="var(--danger)" />
                        </div>
                    </div>
                    <div className="stat-value">
                        {metrics.pendingFinesTotal.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.5rem', fontWeight: 600 }}>
                        Necessita atenção
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Recent Activity */}
                <div className="table-container" style={{ margin: 0 }}>
                    <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Atividade Recente</h3>
                        <button
                            onClick={() => onNavigate('loans')}
                            style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Ver todos <ArrowRight size={14} />
                        </button>
                    </div>
                    <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px', marginTop: '-8px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'transparent' }}>
                                <th style={{ backgroundColor: 'transparent', border: 'none' }}>Usuário</th>
                                <th style={{ backgroundColor: 'transparent', border: 'none' }}>Livro</th>
                                <th style={{ backgroundColor: 'transparent', border: 'none' }}>Devolução</th>
                                <th style={{ backgroundColor: 'transparent', border: 'none' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Sem atividade recente registrada.</td></tr>
                            ) : (
                                loans.map(loan => (
                                    <tr key={loan.id} className="row-hover" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <td style={{ border: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '12px 1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{loan.userName}</div>
                                        </td>
                                        <td style={{ border: 'none', padding: '12px 1rem' }}>{loan.bookTitle}</td>
                                        <td style={{ border: 'none', padding: '12px 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {new Date(loan.expectedReturnDate).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td style={{ border: 'none', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '12px 1rem' }}>
                                            <span className={`badge ${loan.isOverdue ? 'badge-danger' : 'badge-info'}`} style={{ borderRadius: '6px' }}>
                                                {loan.isOverdue ? 'Atrasado' : 'Em dia'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Right Sidebar: Popular Books & Quick Tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={16} color="var(--primary)" /> Mais Procurados
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {topBooks.length === 0 ? (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Sem dados.</p>
                            ) : (
                                topBooks.map((book, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: idx === 0 ? '#FEF3C7' : '#F3F4F6', color: idx === 0 ? '#D97706' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{book.loanCount} empréstimos</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>Meta de Leitura</h3>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>Faltam 12 livros para bater a meta da semana!</p>
                        <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '65%', height: '100%', backgroundColor: 'white', borderRadius: '4px' }}></div>
                        </div>
                        <p style={{ fontSize: '0.7rem', textAlign: 'right', marginTop: '6px', fontWeight: 600 }}>65% Concluído</p>
                    </div>
                </div>
            </div>
            {showExportModal && (
                <ExportModal onClose={() => setShowExportModal(false)} />
            )}
        </div>
    );
};

export default Dashboard;
