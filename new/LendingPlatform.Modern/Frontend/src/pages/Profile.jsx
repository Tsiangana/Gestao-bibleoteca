import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, History, Camera, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { api } from '../api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [toast, setToast] = useState(null);
    const [showPwdFields, setShowPwdFields] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('library_user');
        if (saved) {
            const user = JSON.parse(saved);
            setProfile(user);
            setForm({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, []);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const getInitials = (name = '') =>
        name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const getRoleLabel = (role) => {
        const map = { Admin: 'Administrador', Student: 'Estudante', Professor: 'Professor', Librarian: 'Bibliotecário' };
        return map[role] || role;
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        try {
            const updated = await api.put(`/users/${profile.id}`, {
                ...profile,
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                address: form.address,
            });
            // Sync localStorage
            const newUser = { ...profile, ...updated };
            localStorage.setItem('library_user', JSON.stringify(newUser));
            setProfile(newUser);
            showToast('success', 'Dados actualizados com sucesso!');
        } catch (err) {
            showToast('error', err.data?.message || 'Erro ao actualizar dados.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            showToast('error', 'As palavras-passe não coincidem.');
            return;
        }
        if (pwdForm.newPassword.length < 6) {
            showToast('error', 'A nova palavra-passe deve ter pelo menos 6 caracteres.');
            return;
        }
        setSavingPwd(true);
        try {
            // Verify current password by attempting login
            await api.post('/auth/login', { email: profile.email, password: pwdForm.currentPassword });
            // Update via users endpoint (send password field)
            await api.put(`/users/${profile.id}`, { ...profile, password: pwdForm.newPassword });
            setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPwdFields(false);
            showToast('success', 'Palavra-passe alterada com sucesso!');
        } catch (err) {
            showToast('error', 'Palavra-passe actual incorrecta ou erro ao alterar.');
        } finally {
            setSavingPwd(false);
        }
    };

    if (!profile) return <div style={{ padding: '2rem', textAlign: 'center' }}>A carregar perfil...</div>;

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${toast.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`,
                    color: toast.type === 'success' ? '#065F46' : '#991B1B',
                    padding: '0.875rem 1.25rem', borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontWeight: 600, fontSize: '0.875rem'
                }}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.message}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2>Meu Perfil</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Gerencie suas informações pessoais e segurança da conta.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 300px) 1fr', gap: '2rem' }}>
                {/* Profile Card */}
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                        <div className="avatar" style={{ width: '100%', height: '100%', fontSize: '2.5rem', fontWeight: 600 }}>
                            {getInitials(profile.fullName)}
                        </div>
                    </div>
                    <h3 style={{ margin: 0 }}>{profile.fullName}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0' }}>{profile.email}</p>
                    <span className="badge" style={{ backgroundColor: profile.role === 'Admin' ? '#4F46E5' : 'var(--primary)', color: 'white' }}>
                        Gestor
                    </span>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left' }}>
                        {profile.studentNumber && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                <User size={16} color="var(--text-secondary)" /> BI: {profile.studentNumber}
                            </div>
                        )}
                        {profile.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                <History size={16} color="var(--text-secondary)" /> {profile.phone}
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                            <Shield size={16} color="var(--text-secondary)" /> Conta verificada
                        </div>
                    </div>
                </div>

                {/* Edit Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Personal Info */}
                    <div className="card">
                        <div className="table-header">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Informações Pessoais</h3>
                        </div>
                        <form onSubmit={handleUpdateInfo}>
                            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Nome Completo</label>
                                    <input
                                        type="text"
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Email Principal</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Telefone</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        style={{ width: '100%' }}
                                        placeholder="Ex: +244 9xx xxx xxx"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Endereço</label>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                        style={{ width: '100%' }}
                                        placeholder="Ex: Luanda, Angola"
                                    />
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                        style={{ opacity: saving ? 0.7 : 1 }}
                                    >
                                        {saving ? 'A actualizar...' : 'Actualizar Dados'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="card">
                        <div className="table-header">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Segurança</h3>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Change Password */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ backgroundColor: '#EEF2FF', padding: '0.75rem', borderRadius: '8px' }}>
                                    <Key size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alterar Palavra-passe</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recomendamos o uso de senhas fortes e únicas.</div>
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    style={{ marginLeft: 'auto' }}
                                    onClick={() => setShowPwdFields(v => !v)}
                                >
                                    {showPwdFields ? 'Cancelar' : 'Alterar'}
                                </button>
                            </div>

                            {/* Password fields (shown on demand) */}
                            {showPwdFields && (
                                <form onSubmit={handleChangePassword} style={{ paddingLeft: '3.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}>Palavra-passe Actual</label>
                                        <input
                                            type="password"
                                            value={pwdForm.currentPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                                            style={{ width: '100%', maxWidth: '320px' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}>Nova Palavra-passe</label>
                                        <input
                                            type="password"
                                            value={pwdForm.newPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                            style={{ width: '100%', maxWidth: '320px' }}
                                            required minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}>Confirmar Nova Palavra-passe</label>
                                        <input
                                            type="password"
                                            value={pwdForm.confirmPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                            style={{ width: '100%', maxWidth: '320px' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <button type="submit" className="btn btn-primary" disabled={savingPwd} style={{ opacity: savingPwd ? 0.7 : 1 }}>
                                            <Lock size={14} /> {savingPwd ? 'A guardar...' : 'Guardar Nova Palavra-passe'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
