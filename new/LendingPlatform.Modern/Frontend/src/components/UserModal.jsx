import React, { useState } from 'react';
import { X } from 'lucide-react';

const UserModal = ({ onClose, onSave }) => {
    const [user, setUser] = useState({
        fullName: '',
        email: '',
        password: 'password123',
        role: 'Student',
        studentNumber: '',
        phone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user);
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
                <h2 style={{ marginBottom: '1.5rem' }}>Cadastrar Novo Usuário</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nome Completo</label>
                        <input type="text" required style={{ width: '100%' }} value={user.fullName} onChange={e => setUser({ ...user, fullName: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
                        <input type="email" required style={{ width: '100%' }} value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Cargo / Role</label>
                            <select style={{ width: '100%' }} value={user.role} onChange={e => setUser({ ...user, role: e.target.value })}>
                                <option value="Student">Estudante</option>
                                <option value="Professor">Professor</option>
                                <option value="Librarian">Bibliotecário</option>
                                <option value="Admin">Administrador</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nº Matrícula (opcional)</label>
                            <input type="text" style={{ width: '100%' }} value={user.studentNumber} onChange={e => setUser({ ...user, studentNumber: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Senha Inicial</label>
                        <input type="password" required style={{ width: '100%' }} value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} />
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar Usuário</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
