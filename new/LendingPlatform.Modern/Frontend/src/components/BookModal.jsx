import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';

const BookModal = ({ onClose, onSave, initialData }) => {
    const [categories, setCategories] = useState([]);
    const [book, setBook] = useState(initialData || {
        title: '',
        authors: '',
        isbn: '',
        publisher: '',
        publishYear: new Date().getFullYear(),
        totalCopies: 1,
        location: '',
        description: '',
        categoryId: null,
        coverUrl: '',
        keywords: '',
        internalCode: '',
        barcode: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setBook({
                ...initialData,
                publishYear: initialData.publishYear || new Date().getFullYear(),
                totalCopies: initialData.totalCopies || 1
            });
        }
    }, [initialData]);

    const fetchCategories = async () => {
        try {
            const data = await api.get('/categories');
            setCategories(data || []);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(book);
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1200,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '600px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>{book.id ? 'Editar Livro' : 'Cadastrar Novo Livro'}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Título do Livro</label>
                        <input type="text" required placeholder="Ex: O Guia do Mochileiro das Galáxias" style={{ width: '100%' }} value={book.title} onChange={e => setBook({ ...book, title: e.target.value })} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Autor(es)</label>
                            <input type="text" required placeholder="Ex: Douglas Adams" style={{ width: '100%' }} value={book.authors} onChange={e => setBook({ ...book, authors: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Categoria</label>
                            <select
                                required
                                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                value={book.categoryId || ''}
                                onChange={e => setBook({ ...book, categoryId: parseInt(e.target.value) || null })}
                            >
                                <option value="">Selecionar Categoria...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Editora</label>
                            <input type="text" placeholder="Ex: Editora Arqueiro" style={{ width: '100%' }} value={book.publisher} onChange={e => setBook({ ...book, publisher: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Ano de Publicação</label>
                            <input type="number" placeholder="2024" style={{ width: '100%' }} value={book.publishYear} onChange={e => setBook({ ...book, publishYear: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>ISBN</label>
                            <input type="text" placeholder="000-00-000-0000-0" style={{ width: '100%' }} value={book.isbn} onChange={e => setBook({ ...book, isbn: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Localização</label>
                            <input type="text" placeholder="Ex: Corredor A, Prateleira 2" style={{ width: '100%' }} value={book.location} onChange={e => setBook({ ...book, location: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Quantidade Total</label>
                            <input type="number" min="1" required style={{ width: '100%' }} value={book.totalCopies} onChange={e => setBook({ ...book, totalCopies: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>URL da Capa (opcional)</label>
                            <input type="text" placeholder="https://exemplo.com/imagem.jpg" style={{ width: '100%' }} value={book.coverUrl} onChange={e => setBook({ ...book, coverUrl: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Descrição / Sinopse</label>
                        <textarea
                            rows="3"
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'inherit', resize: 'vertical' }}
                            value={book.description}
                            onChange={e => setBook({ ...book, description: e.target.value })}
                            placeholder="Breve resumo da obra..."
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
                            {book.id ? 'Atualizar Livro' : 'Salvar Livro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookModal;
