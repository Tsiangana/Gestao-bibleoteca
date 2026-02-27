import React, { useState } from 'react';
import { Save, Shield, Bell, Globe, Database, Layout } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('library');

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Configurações do Sistema</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Gerencie as regras de negócio e preferências da plataforma.
                    </p>
                </div>
                <button className="btn btn-primary">
                    <Save size={16} /> Salvar Alterações
                </button>
            </div>

            <div className="card" style={{ display: 'flex', padding: 0, overflow: 'hidden' }}>
                {/* Sidebar Mini */}
                <div style={{ width: '200px', borderRight: '1px solid var(--border-color)', backgroundColor: '#F9FAFB' }}>
                    <button
                        onClick={() => setActiveTab('library')}
                        style={{ width: '100%', padding: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500, color: activeTab === 'library' ? 'var(--primary)' : 'var(--text-secondary)', backgroundColor: activeTab === 'library' ? 'white' : 'transparent', borderLeft: activeTab === 'library' ? '3px solid var(--primary)' : '3px solid transparent' }}
                    >
                        <Database size={16} /> Regras da Biblioteca
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        style={{ width: '100%', padding: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500, color: activeTab === 'notifications' ? 'var(--primary)' : 'var(--text-secondary)', backgroundColor: activeTab === 'notifications' ? 'white' : 'transparent', borderLeft: activeTab === 'notifications' ? '3px solid var(--primary)' : '3px solid transparent' }}
                    >
                        <Bell size={16} /> Notificações
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        style={{ width: '100%', padding: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500, color: activeTab === 'appearance' ? 'var(--primary)' : 'var(--text-secondary)', backgroundColor: activeTab === 'appearance' ? 'white' : 'transparent', borderLeft: activeTab === 'appearance' ? '3px solid var(--primary)' : '3px solid transparent' }}
                    >
                        <Layout size={16} /> Aparência
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, padding: '2rem' }}>
                    {activeTab === 'library' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Valor da Multa Diária (R$)</label>
                                <input type="number" defaultValue="2.00" step="0.50" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Prazo Padrão de Empréstimo (Dias)</label>
                                <input type="number" defaultValue="14" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Limite Máximo de Livros por Usuário</label>
                                <input type="number" defaultValue="3" style={{ width: '100%' }} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Alertas de Atraso por E-mail</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enviar notificações automáticas para usuários com livros vencidos.</div>
                                </div>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Notificar Novas Reservas</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Alertar bibliotecário quando um livro reservado for devolvido.</div>
                                </div>
                                <input type="checkbox" defaultChecked />
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Tema do Painel</label>
                                <select style={{ width: '100%' }}>
                                    <option>Light Mode (Claro)</option>
                                    <option>Dark Mode (Escuro)</option>
                                    <option>Sistema (Automático)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
