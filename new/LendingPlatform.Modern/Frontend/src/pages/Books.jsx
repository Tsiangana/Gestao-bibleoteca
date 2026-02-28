import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, Download, MoreVertical, Search, Book as BookIcon, Edit, Trash2 } from 'lucide-react';
import { api } from '../api';

import BookModal from '../components/BookModal';
import BookDetailsModal from '../components/BookDetailsModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Books = ({ selectedId, onClearSelection }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [selectedBookId, setSelectedBookId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const itemsPerPage = 10;
    const menuRef = useRef(null);

    useEffect(() => {
        fetchBooks();

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (selectedId) {
            setSelectedBookId(selectedId);
            setShowDetailsModal(true);
        }
    }, [selectedId]);

    // Reset current page when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

    const handleSaveBook = async (bookData) => {
        try {
            if (bookData.id) {
                await api.put(`/books/${bookData.id}`, bookData);
            } else {
                await api.post('/books', bookData);
            }
            handleCloseModal();
            fetchBooks();
        } catch (err) {
            alert('Erro ao salvar livro');
            console.error(err);
        }
    };

    const handleDeleteBook = async () => {
        if (!bookToDelete) return;
        try {
            await api.delete(`/books/${bookToDelete.id}`);
            setIsDeleteModalOpen(false);
            setBookToDelete(null);
            fetchBooks();
        } catch (err) {
            alert('Erro ao eliminar livro');
            console.error(err);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowDetailsModal(false);
        setEditingBook(null);
        setSelectedBookId(null);
        if (onClearSelection) onClearSelection();
    };

    const handleExport = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Relatório de Acervo - CSpirita', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["Título", "Autor(es)", "ISBN", "Categoria", "Disponíveis"];
        const tableRows = filteredBooks.map(book => [
            book.title,
            book.authors,
            book.isbn,
            book.categoryName || 'N/A',
            `${book.availableCopies} / ${book.totalCopies}`
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`acervo-biblioteca-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

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
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={16} /> Exportar
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Novo Livro
                    </button>
                </div>
            </div>

            {showDetailsModal && (
                <BookDetailsModal
                    bookId={selectedBookId}
                    onClose={handleCloseModal}
                />
            )}

            {showModal && (
                <BookModal
                    onClose={handleCloseModal}
                    onSave={handleSaveBook}
                    initialData={editingBook}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteBook}
                title="Eliminar Livro"
                message={`Tem certeza que deseja eliminar o livro "${bookToDelete?.title}"? Esta ação removerá todas as informações vinculadas a ele e não pode ser desfeita.`}
                confirmText="Eliminar permanentemente"
                type="danger"
            />

            <div className="table-container">
                <div className="table-header">
                    <div className="search-bar" style={{ width: '350px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Buscar por título, autor ou ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                        {currentItems.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum livro encontrado.</td></tr>
                        ) : (
                            currentItems.map(book => (
                                <tr key={book.id}>
                                    <td><input type="checkbox" /></td>
                                    <td
                                        onClick={() => {
                                            setSelectedBookId(book.id);
                                            setShowDetailsModal(true);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
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
                                    <td style={{ position: 'relative' }}>
                                        <button
                                            className="action-icon"
                                            style={{ padding: '0.5rem' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === book.id ? null : book.id);
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeMenuId === book.id && (
                                            <div
                                                ref={menuRef}
                                                style={{
                                                    position: 'absolute',
                                                    ...(currentItems.indexOf(book) > 5
                                                        ? { bottom: '100%', marginBottom: '-25px' }
                                                        : { top: '100%', marginTop: '-25px' }
                                                    ),
                                                    right: 85,
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingBook(book);
                                                        setShowModal(true);
                                                        setActiveMenuId(null);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                                                        e.currentTarget.style.paddingLeft = '1.5rem';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.paddingLeft = '1.25rem';
                                                    }}
                                                >
                                                    <Edit size={16} color="var(--primary)" />
                                                    Atualizar Dados
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBookToDelete(book);
                                                        setIsDeleteModalOpen(true);
                                                        setActiveMenuId(null);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                                                        e.currentTarget.style.paddingLeft = '1.5rem';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.paddingLeft = '1.25rem';
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar Livro
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBooks.length)} de {filteredBooks.length} resultado(s)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: '1rem' }}>
                            Página {currentPage} de {totalPages || 1}
                        </span>
                        <button
                            className="btn btn-secondary"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Anterior
                        </button>
                        <button
                            className="btn btn-secondary"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Books;
