import React, { useState } from 'react';
import { Book, Mail, Lock, UserPlus, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

const INSTITUTION_ID = '272003';

const InputField = ({ icon: Icon, type = 'text', placeholder, value, onChange, required, minLength, rightElement }) => (
    <div style={{ position: 'relative' }}>
        <Icon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            minLength={minLength}
            style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem' }}
        />
        {rightElement && (
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                {rightElement}
            </div>
        )}
    </div>
);

const Register = ({ onRegister, onShowLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [institutionId, setInstitutionId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate institution ID
        if (institutionId.trim() !== INSTITUTION_ID) {
            setError('ID institucional inválido. Contacte o administrador do sistema.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As palavras-passe não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A palavra-passe deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const user = await api.post('/auth/register', {
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                role: 'Student',
                status: 'Active'
            });
            onRegister(user);
        } catch (err) {
            if (err.status === 409 || err.data?.message?.toLowerCase().includes('email')) {
                setError('Já existe uma conta com este email. Faça login ou use outro email.');
            } else {
                setError(err.data?.message || 'Erro ao criar conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = { marginBottom: '1.25rem' };
    const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 100%)',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem 1rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '450px',
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

                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Criar nova conta</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Preencha os dados abaixo para se registar na plataforma.
                </p>

                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: '0.875rem', textAlign: 'left' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    {/* Institution ID — first and most important */}
                    <div style={{ ...fieldStyle, padding: '1rem', backgroundColor: '#F0F9FF', borderRadius: '0.75rem', border: '1px solid #BAE6FD' }}>
                        <label style={{ ...labelStyle, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={15} /> ID Institucional
                        </label>
                        <InputField
                            icon={ShieldCheck}
                            type="text"
                            placeholder="Código de acesso da instituição"
                            value={institutionId}
                            onChange={e => setInstitutionId(e.target.value)}
                            required
                        />
                        <p style={{ fontSize: '0.72rem', color: '#0369A1', marginTop: '0.4rem', marginBottom: 0 }}>
                            Solicite o ID ao administrador do sistema para se registar.
                        </p>
                    </div>

                    {/* Full Name */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Nome Completo</label>
                        <InputField
                            icon={User}
                            placeholder="O seu nome completo"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Email</label>
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder="nome@exemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Palavra-passe</label>
                        <InputField
                            icon={Lock}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            rightElement={
                                showPassword
                                    ? <EyeOff size={16} color="var(--text-secondary)" onClick={() => setShowPassword(false)} />
                                    : <Eye size={16} color="var(--text-secondary)" onClick={() => setShowPassword(true)} />
                            }
                        />
                    </div>

                    {/* Confirm Password */}
                    <div style={{ ...fieldStyle, marginBottom: '1.75rem' }}>
                        <label style={labelStyle}>Confirmar Palavra-passe</label>
                        <InputField
                            icon={Lock}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Repita a palavra-passe"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            rightElement={
                                showConfirm
                                    ? <EyeOff size={16} color="var(--text-secondary)" onClick={() => setShowConfirm(false)} />
                                    : <Eye size={16} color="var(--text-secondary)" onClick={() => setShowConfirm(true)} />
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
                    >
                        <UserPlus size={18} /> {loading ? 'A criar conta...' : 'Criar Conta'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Já possui uma conta?{' '}
                    <button onClick={onShowLogin} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
                        Faça login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;
