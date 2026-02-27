import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, MoreVertical, Search, Book as BookIcon } from 'lucide-react';
import { api } from '../api';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await api.get('/books');
            setBooks(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar livros');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Available': return <span className="badge badge-success">Disponível</span>;
            case 'Lent': return <span className="badge badge-danger">Emprestado</span>;
            case 'Reserved': return <span className="badge badge-warning">Reservado</span>;
            default: return <span className="badge badge-info">{status}</span>;
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando acervo...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Gestão de Acervo</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Gerencie todos os livros, categorias e exemplares.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary">
                        <Download size={16} /> Exportar
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={16} /> Novo Livro
                    </button>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <div className="search-bar" style={{ width: '350px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input type="text" placeholder="Buscar por título, autor ou ISBN..." />
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                        <Filter size={16} /> Filtros
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}><input type="checkbox" /></th>
                            <th>Livro Info</th>
                            <th>Categoria</th>
                            <th>Estoque</th>
                            <th>Status Geral</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum livro encontrado.</td></tr>
                        ) : (
                            books.map(book => (
                                <tr key={book.id}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '56px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {book.coverUrl ? (
                                                    <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <BookIcon size={20} color="var(--text-secondary)" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{book.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {book.authors} • ISBN: {book.isbn}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            {book.categoryName || 'Sem Categoria'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{book.availableCopies} / {book.totalCopies}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>disponíveis</div>
                                    </td>
                                    <td>{getStatusBadge(book.status)}</td>
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

                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Mostrando {books.length} resultado(s)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" disabled>Anterior</button>
                        <button className="btn btn-secondary" disabled>Próximo</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Books;
