import React, { useState } from 'react';
import { Book, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

const Login = ({ onLogin, onShowRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Preencha o email e a palavra-passe.');
            return;
        }

        setLoading(true);
        try {
            const user = await api.post('/auth/login', {
                email: email.trim().toLowerCase(),
                password
            });
            onLogin(user);
        } catch (err) {
            if (err.status === 401 || err.status === 404) {
                setError('Email ou palavra-passe incorrectos. Verifique os seus dados.');
            } else if (err.status === 403) {
                setError('A sua conta está bloqueada. Contacte o administrador.');
            } else {
                setError('Erro ao ligar ao servidor. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 100%)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div className="card login-card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                borderRadius: '1.5rem',
                backgroundColor: 'white',
                textAlign: 'center'
            }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Book size={32} color="var(--primary)" />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>CSpirita</h1>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Bem-vindo de volta</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Gerencie sua biblioteca sem esforço.</p>

                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: '0.875rem', textAlign: 'left' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                            <input
                                type="email"
                                placeholder="nome@exemplo.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Palavra-passe</label>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem' }}
                            />
                            <div
                                onClick={() => setShowPassword(v => !v)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
                    >
                        <LogIn size={18} /> {loading ? 'A entrar...' : 'Entrar no sistema'}
                    </button>
                </form>

                <p style={{ marginTop: '2.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Não tem uma conta?{' '}
                    <button onClick={onShowRegister} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
                        Cadastre-se
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
