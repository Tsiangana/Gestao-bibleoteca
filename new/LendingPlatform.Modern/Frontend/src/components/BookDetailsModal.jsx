import React, { useState, useEffect } from 'react';
import { X, Book, User, Calendar, Clock, MapPin, Tag, Info, History, AlertCircle } from 'lucide-react';
import { api } from '../api';

const BookDetailsModal = ({ bookId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'history'

    useEffect(() => {
        if (bookId) {
            fetchHistory();
        }
    }, [bookId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const result = await api.get(`/books/${bookId}/history`);
            setData(result);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar detalhes do livro');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!bookId) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{
                width: '95%',
                maxWidth: '850px',
                height: '80vh',
                padding: 0,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '85px',
                            backgroundColor: 'var(--bg-main)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}>
                            {data?.book?.coverUrl ? (
                                <img src={data.book.coverUrl} alt="Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Book size={32} color="var(--text-secondary)" />
                            )}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {loading ? 'Carregando...' : data?.book?.title}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                                {data?.book?.authors}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="action-icon" style={{ padding: '0.5rem' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 2rem' }}>
                    <button
                        onClick={() => setActiveTab('info')}
                        style={{
                            padding: '1rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === 'info' ? '2px solid var(--primary)' : '2px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Info size={18} /> Informações Gerais
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '1rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <History size={18} /> Histórico de Empréstimos
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                            <div className="spinner"></div>
                            <p style={{ color: 'var(--text-secondary)' }}>Buscando informações detalhadas...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
                            <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && data && (
                        <>
                            {activeTab === 'info' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <section>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>Sinopse / Descrição</h3>
                                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)', textAlign: 'justify' }}>
                                                {data.book.description || 'Nenhuma descrição disponível para este exemplar.'}
                                            </p>
                                        </section>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                                    <Tag size={18} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CATEGORIA</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{data.book.categoryName || 'Não especificada'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                                    <MapPin size={18} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LOCALIZAÇÃO</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{data.book.location || 'Não definida'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                                    <Calendar size={18} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ANO DE PUBLICAÇÃO</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{data.book.publishYear || 'N/A'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                                    <Clock size={18} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ISBN</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{data.book.isbn || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Status de Disponibilidade</h3>

                                        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: data.book.availableCopies > 0 ? '#F0FDF4' : '#FEF2F2', border: 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, color: data.book.availableCopies > 0 ? '#166534' : '#991B1B' }}>
                                                    {data.book.availableCopies > 0 ? 'Disponível para Empréstimo' : 'Indisponível no momento'}
                                                </span>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    backgroundColor: data.book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)'
                                                }}></div>
                                            </div>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '1rem 0', color: data.book.availableCopies > 0 ? '#166534' : '#991B1B' }}>
                                                {data.book.availableCopies} / {data.book.totalCopies}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: data.book.availableCopies > 0 ? '#166534' : '#991B1B', opacity: 0.8 }}>
                                                exemplares disponíveis no estoque físico.
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Total de Empréstimos:</span>
                                                <span style={{ fontWeight: 600 }}>{data.totalLoans}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Empréstimos Ativos:</span>
                                                <span style={{ fontWeight: 600 }}>{data.activeLoans}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>ID Interno:</span>
                                                <span style={{ cursor: 'pointer', color: 'var(--primary)' }}>#BK-{data.book.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div>
                                    {data.loans.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                                            <History size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p>Este livro ainda não possui histórico de empréstimos.</p>
                                        </div>
                                    ) : (
                                        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                                            <table style={{ width: '100%' }}>
                                                <thead>
                                                    <tr>
                                                        <th>Usuário</th>
                                                        <th>Data Empréstimo</th>
                                                        <th>Data Devolução</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.loans.map(loan => (
                                                        <tr key={loan.id}>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>
                                                                        {loan.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                                    </div>
                                                                    <span style={{ fontWeight: 500 }}>{loan.userName}</span>
                                                                </div>
                                                            </td>
                                                            <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                                                            <td>
                                                                {loan.actualReturnDate ? new Date(loan.actualReturnDate).toLocaleDateString() : (
                                                                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Em aberto</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${loan.status === 'Returned' ? 'badge-success' :
                                                                        loan.status === 'Overdue' ? 'badge-danger' : 'badge-info'
                                                                    }`}>
                                                                    {loan.status === 'Returned' ? 'Devolvido' :
                                                                        loan.status === 'Overdue' ? 'Atrasado' : 'Ativo'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#F9FAFB' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Fechar Detalhes</button>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
