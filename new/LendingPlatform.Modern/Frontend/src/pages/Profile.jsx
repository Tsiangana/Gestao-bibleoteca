import React from 'react';
import { User, Mail, Shield, Key, History, Camera } from 'lucide-react';

const Profile = () => {
    return (
        <div>
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
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                        <div className="avatar" style={{ width: '100%', height: '100%', fontSize: '2.5rem', fontWeight: 600 }}>AS</div>
                        <button style={{ position: 'absolute', bottom: 0, right: 0, padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <Camera size={16} />
                        </button>
                    </div>
                    <h3 style={{ margin: 0 }}>Admin Sistema</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0' }}>admin@lenda.com</p>
                    <span className="badge" style={{ backgroundColor: '#4F46E5', color: 'white' }}>Administrador</span>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                            <History size={16} color="var(--text-secondary)" /> Último acesso: Hoje, 14:02
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                            <Shield size={16} color="var(--text-secondary)" /> Conta verificada
                        </div>
                    </div>
                </div>

                {/* Edit Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <div className="table-header">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Informações Pessoais</h3>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Nome Completo</label>
                                <input type="text" defaultValue="Admin Sistema" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Email Principal</label>
                                <input type="email" defaultValue="admin@lenda.com" style={{ width: '100%' }} />
                            </div>
                            <div style={{ colSpan: 2 }}>
                                <button className="btn btn-primary">Atualizar Dados</button>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="table-header">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Segurança</h3>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ backgroundColor: '#EEF2FF', padding: '0.75rem', borderRadius: '8px' }}>
                                    <Key size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alterar Senha</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recomendamos o uso de senhas fortes e únicas.</div>
                                </div>
                                <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>Alterar</button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ backgroundColor: '#F0FDF4', padding: '0.75rem', borderRadius: '8px' }}>
                                    <Shield size={20} color="var(--success)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Autenticação em Dois Fatores</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adicione uma camada extra de proteção à sua conta.</div>
                                </div>
                                <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>Ativar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
