import React, { useState, useEffect } from 'react';
import { Save, Shield, Bell, Database, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api';

const SettingRow = ({ label, description, children }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 0', borderBottom: '1px solid var(--border-color)', gap: '2rem'
    }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{label}</div>
            {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{description}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
);

const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
            width: 48, height: 26, borderRadius: 999,
            backgroundColor: checked ? 'var(--primary)' : '#D1D5DB',
            border: 'none', cursor: 'pointer', position: 'relative',
            transition: 'background 0.2s', flexShrink: 0
        }}
    >
        <span style={{
            position: 'absolute', top: 3,
            left: checked ? 25 : 3,
            width: 20, height: 20, borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.2s'
        }} />
    </button>
);

const TAB_SIDEBAR = [
    { id: 'library', label: 'Regras da Biblioteca', icon: Database },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'identity', label: 'Identidade', icon: Building2 },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('library');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await api.get('/settings');
            setSettings(data);
        } catch (err) {
            console.error('Erro ao carregar configurações', err);
            showToast('error', 'Erro ao carregar configurações.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await api.put('/settings', settings);
            showToast('success', 'Configurações guardadas com sucesso!');
        } catch (err) {
            console.error('Erro ao salvar configurações', err);
            showToast('error', 'Erro ao guardar configurações.');
        } finally {
            setSaving(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const update = (field, value) => setSettings(prev => ({ ...prev, [field]: value }));

    const tabButton = (tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                    width: '100%', padding: '0.875rem 1rem',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'white' : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <Icon size={16} /> {tab.label}
            </button>
        );
    };

    return (
        <div>
            {/* Toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${toast.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`,
                    color: toast.type === 'success' ? '#065F46' : '#991B1B',
                    padding: '0.875rem 1.25rem', borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontWeight: 600, fontSize: '0.875rem',
                    animation: 'slideIn 0.3s ease'
                }}>
                    {toast.type === 'success'
                        ? <CheckCircle size={18} />
                        : <AlertCircle size={18} />}
                    {toast.message}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2>Configurações do Sistema</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Gerencie as regras de negócio e preferências da plataforma.
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving || loading}
                    style={{ opacity: saving ? 0.7 : 1 }}
                >
                    <Save size={16} /> {saving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
            </div>

            {loading ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    A carregar configurações...
                </div>
            ) : settings && (
                <div className="card" style={{ display: 'flex', padding: 0, overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <div style={{ width: '220px', borderRight: '1px solid var(--border-color)', backgroundColor: '#F9FAFB', flexShrink: 0 }}>
                        {TAB_SIDEBAR.map(tabButton)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '100%' }}>

                        {/* ---- LIBRARY TAB ---- */}
                        {activeTab === 'library' && (
                            <div>
                                <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>Regras da Biblioteca</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                                    Estas regras aplicam-se automaticamente a todos os empréstimos e multas gerados.
                                </p>

                                <SettingRow
                                    label="Valor da Multa Diária (Kz)"
                                    description="Valor cobrado por cada dia de atraso na devolução de um livro."
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Kz</span>
                                        <input
                                            type="number"
                                            min="100"
                                            step="100"
                                            value={settings.dailyFineRate}
                                            onChange={e => update('dailyFineRate', parseFloat(e.target.value))}
                                            style={{ width: '120px', textAlign: 'right' }}
                                        />
                                    </div>
                                </SettingRow>

                                <SettingRow
                                    label="Prazo Padrão de Empréstimo (dias)"
                                    description="Número de dias padrão atribuído ao criar um novo empréstimo."
                                >
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={settings.defaultLoanDays}
                                        onChange={e => update('defaultLoanDays', parseInt(e.target.value))}
                                        style={{ width: '120px', textAlign: 'right' }}
                                    />
                                </SettingRow>

                                <SettingRow
                                    label="Limite de Livros por Utilizador"
                                    description="Número máximo de livros que um utilizador pode ter em empréstimo simultaneamente."
                                >
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={settings.maxBooksPerUser}
                                        onChange={e => update('maxBooksPerUser', parseInt(e.target.value))}
                                        style={{ width: '120px', textAlign: 'right' }}
                                    />
                                </SettingRow>

                                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '0.8rem', color: '#92400E' }}>
                                    ⚠️ Alterações ao valor da multa diária afectam apenas empréstimos <strong>futuros</strong>. Multas já geradas não são recalculadas.
                                </div>
                            </div>
                        )}

                        {/* ---- NOTIFICATIONS TAB ---- */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>Notificações</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                                    Controla quais os eventos que geram notificações automáticas no sistema.
                                </p>

                                <SettingRow
                                    label="Alertas de Atraso"
                                    description="Gerar notificação no painel quando um empréstimo ultrapassar a data de devolução."
                                >
                                    <Toggle
                                        checked={settings.notifyOverdueByEmail}
                                        onChange={val => update('notifyOverdueByEmail', val)}
                                    />
                                </SettingRow>

                                <SettingRow
                                    label="Notificar Novas Reservas"
                                    description="Alertar o bibliotecário quando um livro reservado ficar disponível."
                                >
                                    <Toggle
                                        checked={settings.notifyNewReservations}
                                        onChange={val => update('notifyNewReservations', val)}
                                    />
                                </SettingRow>
                            </div>
                        )}

                        {/* ---- IDENTITY TAB ---- */}
                        {activeTab === 'identity' && (
                            <div>
                                <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>Identidade da Biblioteca</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                                    Informações que identificam a instituição nesta plataforma.
                                </p>

                                <SettingRow
                                    label="Nome da Biblioteca"
                                    description="Aparece no cabeçalho e nos relatórios gerados pelo sistema."
                                >
                                    <input
                                        type="text"
                                        value={settings.libraryName}
                                        onChange={e => update('libraryName', e.target.value)}
                                        style={{ width: '240px' }}
                                        placeholder="Ex: Biblioteca Municipal"
                                    />
                                </SettingRow>

                                <SettingRow
                                    label="Última Actualização"
                                    description="Data em que as configurações foram guardadas pela última vez."
                                >
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        {new Date(settings.updatedAt).toLocaleString('pt-AO')}
                                    </span>
                                </SettingRow>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
