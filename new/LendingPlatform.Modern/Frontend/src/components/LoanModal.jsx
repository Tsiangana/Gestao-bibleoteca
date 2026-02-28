import React, { useState, useEffect, useRef } from 'react';
import { X, Search, User, BookOpen, Check } from 'lucide-react';
import { api } from '../api';

// Reusable searchable autocomplete field
const SearchableSelect = ({ label, placeholder, items, displayKey, subKey, onSelect, icon: Icon }) => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const filtered = items.filter(item =>
        item[displayKey]?.toLowerCase().includes(query.toLowerCase()) ||
        (subKey && item[subKey]?.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 8); // Limit to 8 suggestions

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setSelected(item);
        setQuery('');
        setOpen(false);
        onSelect(item);
    };

    const handleClear = () => {
        setSelected(null);
        setQuery('');
        onSelect(null);
    };

    return (
        <div style={{ marginBottom: '1.25rem' }} ref={ref}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                {label}
            </label>

            {selected ? (
                // Selected pill
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: '#EFF6FF',
                    border: '1.5px solid var(--primary)',
                    borderRadius: '8px',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Check size={16} color="var(--primary)" />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{selected[displayKey]}</div>
                            {subKey && selected[subKey] && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selected[subKey]}</div>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                // Search input + dropdown
                <div style={{ position: 'relative' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 0.875rem',
                        border: open ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        transition: 'border 0.2s',
                        boxShadow: open ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
                    }}>
                        {Icon && <Icon size={16} color="var(--text-secondary)" />}
                        <input
                            type="text"
                            value={query}
                            placeholder={placeholder}
                            onChange={e => { setQuery(e.target.value); setOpen(true); }}
                            onFocus={() => setOpen(true)}
                            style={{
                                border: 'none', outline: 'none', width: '100%',
                                fontSize: '0.875rem', color: 'var(--text-main)',
                                backgroundColor: 'transparent'
                            }}
                        />
                        <Search size={14} color="var(--text-secondary)" />
                    </div>

                    {open && query.length > 0 && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                            border: '1px solid var(--border-color)',
                            zIndex: 2000,
                            overflow: 'hidden',
                            maxHeight: '220px',
                            overflowY: 'auto'
                        }}>
                            {filtered.length === 0 ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Nenhum resultado encontrado
                                </div>
                            ) : (
                                filtered.map(item => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            width: '100%', padding: '0.75rem 1rem',
                                            border: 'none', background: 'none',
                                            cursor: 'pointer', textAlign: 'left',
                                            transition: 'background 0.15s',
                                            borderBottom: '1px solid var(--border-color)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0F7FF'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            backgroundColor: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {Icon && <Icon size={14} color="white" />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{item[displayKey]}</div>
                                            {subKey && item[subKey] && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item[subKey]}</div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Main modal
const LoanModal = ({ onClose, onSave }) => {
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [daysToLoan, setDaysToLoan] = useState(14);
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
            setBooks(b.filter(book => book.availableCopies > 0).map(b => ({
                ...b,
                subtitle: `${b.availableCopies} disponíve${b.availableCopies === 1 ? 'l' : 'is'}`
            })));
            setUsers(u.filter(user => user.status === 'Active').map(u => ({
                ...u,
                subtitle: u.studentNumber ? `BI: ${u.studentNumber}` : u.email || 'Membro'
            })));
        } catch (err) {
            console.error('Erro ao carregar dados para empréstimo', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser || !selectedBook) return;
        onSave({
            userId: selectedUser.id,
            bookId: selectedBook.id,
            daysToLoan: parseInt(daysToLoan)
        });
    };

    const canSubmit = selectedUser && selectedBook;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '480px', padding: '1.75rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '0.25rem' }}>Novo Empréstimo</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Pesquise e selecione o utilizador e o livro
                </p>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>A carregar dados...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <SearchableSelect
                            label="Utilizador (Ativo)"
                            placeholder="Pesquisar por nome ou BI..."
                            items={users}
                            displayKey="fullName"
                            subKey="subtitle"
                            onSelect={setSelectedUser}
                            icon={User}
                        />

                        <SearchableSelect
                            label="Livro (Disponível)"
                            placeholder="Pesquisar por título..."
                            items={books}
                            displayKey="title"
                            subKey="subtitle"
                            onSelect={setSelectedBook}
                            icon={BookOpen}
                        />

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Prazo (dias)
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                style={{ width: '100%' }}
                                value={daysToLoan}
                                onChange={e => setDaysToLoan(e.target.value)}
                            />
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!canSubmit}
                                style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                            >
                                Confirmar Empréstimo
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoanModal;
