import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1200,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '400px', padding: '2rem', textAlign: 'center' }}>
                <div style={{
                    width: '56px', height: '56px',
                    backgroundColor: type === 'danger' ? '#FEE2E2' : '#F5F3FF',
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 1.5rem',
                    color: type === 'danger' ? 'var(--danger)' : 'var(--primary)'
                }}>
                    <AlertCircle size={28} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn btn-${type}`}
                        style={{ flex: 1 }}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
