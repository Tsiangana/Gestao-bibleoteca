import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';

const LoanModal = ({ onClose, onSave }) => {
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        userId: '',
        bookId: '',
        daysToLoan: 14
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [b, u] = await Promise.all([
                api.get('/books'),
                api.get('/users')
            ]);
            setBooks(b.filter(book => book.availableCopies > 0));
            setUsers(u.filter(user => user.status === 'Active'));
        } catch (err) {
            console.error('Erro ao carregar dados para empréstimo', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            userId: parseInt(form.userId),
            bookId: parseInt(form.bookId),
            daysToLoan: parseInt(form.daysToLoan)
        });
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '450px', padding: '1.5rem', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem' }}>Novo Empréstimo</h2>

                {loading ? (
                    <p>Carregando dados...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Usuário (Ativo)</label>
                            <select required style={{ width: '100%' }} value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
                                <option value="">Selecione um usuário...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName} ({u.studentNumber || 'Membro'})</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Livro (Disponível)</label>
                            <select required style={{ width: '100%' }} value={form.bookId} onChange={e => setForm({ ...form, bookId: e.target.value })}>
                                <option value="">Selecione um livro...</option>
                                {books.map(b => (
                                    <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} disponíveis)</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Prazo (dias)</label>
                            <input type="number" min="1" required style={{ width: '100%' }} value={form.daysToLoan} onChange={e => setForm({ ...form, daysToLoan: e.target.value })} />
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Confirmar Empréstimo</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoanModal;
