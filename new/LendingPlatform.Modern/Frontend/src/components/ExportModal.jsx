import React, { useState } from 'react';
import { X, FileText, Calendar, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../api';

const ExportModal = ({ onClose }) => {
    const [period, setPeriod] = useState('current_month'); // 'current_month', 'current_year', 'all'
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle', 'generating', 'success', 'error'

    const generatePDF = (loans) => {
        try {
            console.log('Iniciando geração de PDF com', loans.length, 'itens');

            // Access jsPDF from window (UMD build from CDN)
            const jsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;

            if (!jsPDFConstructor) {
                throw new Error('Biblioteca PDF não encontrada. Verifique sua conexão com a internet.');
            }

            const doc = new jsPDFConstructor();

            // Configurar Cabeçalho
            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // Cor Primária
            doc.text('Relatório de Atividades - Lenda', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(107, 114, 128);
            const periodText = period === 'current_month' ? 'Mês Atual' : (period === 'current_year' ? 'Ano Corrente' : 'Todo o Histórico');
            doc.text(`Período: ${periodText}`, 14, 30);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 35);

            // Preparar Dados da Tabela
            const tableColumn = ["ID", "Livro", "Usuário", "Data Empréstimo", "Data Devolução", "Status"];
            const tableRows = loans.map(loan => [
                `#${loan.id}`,
                loan.bookTitle,
                loan.userName,
                new Date(loan.loanDate).toLocaleDateString('pt-BR'),
                loan.actualReturnDate ? new Date(loan.actualReturnDate).toLocaleDateString('pt-BR') : 'Pendente',
                loan.status === 'Returned' ? 'Devolvido' : (loan.status === 'Overdue' ? 'Atrasado' : 'Ativo')
            ]);

            // Gerar Tabela (Usando o plugin autoTable se disponível)
            if (typeof doc.autoTable === 'function') {
                doc.autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 45,
                    theme: 'striped',
                    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
                    styles: { fontSize: 8, cellPadding: 3 },
                    alternateRowStyles: { fillColor: [249, 250, 251] }
                });

                // Resumo após a tabela
                const finalY = doc.lastAutoTable.finalY + 15;
                doc.setFontSize(12);
                doc.setTextColor(31, 41, 55);
                doc.text('Resumo Executivo:', 14, finalY);

                doc.setFontSize(10);
                doc.text(`Total de Atividades: ${loans.length}`, 14, finalY + 7);
                doc.text(`Empréstimos Ativos: ${loans.filter(l => l.status !== 'Returned').length}`, 14, finalY + 12);
            } else {
                console.warn('Plugin autoTable não detectado. Usando modo de texto simples.');
                doc.text('Histórico de Atividades:', 14, 45);
                let y = 55;
                tableRows.slice(0, 20).forEach(row => {
                    doc.text(row.join(' | '), 14, y);
                    y += 8;
                });
            }

            // Salvar o arquivo
            const fileName = `Relatorio_Atividades_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            console.log('Download do PDF iniciado com sucesso.');
        } catch (err) {
            console.error('Erro crítico na geração do PDF:', err);
            throw err;
        }
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            setStatus('generating');

            const now = new Date();
            let url = '/dashboard/export-data';

            if (period === 'current_month') {
                url += `?month=${now.getMonth() + 1}&year=${now.getFullYear()}`;
            } else if (period === 'current_year') {
                url += `?year=${now.getFullYear()}`;
            }

            const data = await api.get(url);

            if (data) {
                generatePDF(data);
                setStatus('success');
                setTimeout(() => onClose(), 2000);
            }
        } catch (err) {
            console.error('Erro na exportação:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '450px', padding: '2.5rem', position: 'relative' }}>
                <button onClick={onClose} className="action-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', backgroundColor: '#EEF2FF',
                        borderRadius: '16px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)'
                    }}>
                        <FileText size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Exportar Atividades</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Selecione o período para o seu relatório em PDF.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { id: 'current_month', label: 'Mês Atual', icon: <Calendar size={18} /> },
                        { id: 'current_year', label: 'Ano Corrente', icon: <FileText size={18} /> },
                        { id: 'all', label: 'Todo o Histórico', icon: <Download size={18} /> }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            style={{
                                padding: '1rem', border: '2px solid',
                                borderColor: period === p.id ? 'var(--primary)' : 'var(--border-color)',
                                backgroundColor: period === p.id ? '#F5F3FF' : 'white',
                                borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ color: period === p.id ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                {p.icon}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{p.label}</span>
                        </button>
                    ))}
                </div>

                {status === 'generating' && (
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                        <div className="spinner" style={{ margin: '0 auto 0.75rem' }}></div>
                        Gerando relatório...
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--success)', fontWeight: 600 }}>
                        <CheckCircle size={24} style={{ marginBottom: '0.5rem' }} />
                        <p>Exportação concluída!</p>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--danger)', fontWeight: 600 }}>
                        <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
                        <p>Erro ao gerar relatório.</p>
                        <p style={{ fontSize: '0.7rem', fontWeight: 400, marginTop: '4px' }}>Verifique sua conexão ou tente outro período.</p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleExport} disabled={loading}>
                        {loading ? 'Processando...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
