import React, { useState, useMemo } from 'react';
import { AccountsReceivable, AccountsReceivableStatus, User, Contract } from '../types';
import { storage } from '../services/storage';
import { ReportService } from '../services/reports';

interface AccountsReceivableManagerProps {
    receivables: AccountsReceivable[];
    contracts: Contract[];
    currentUser: User;
    onUpdate: () => void;
}

const AccountsReceivableManager: React.FC<AccountsReceivableManagerProps> = ({
    receivables,
    contracts,
    currentUser,
    onUpdate
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editingReceivable, setEditingReceivable] = useState<AccountsReceivable | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const filteredReceivables = useMemo(() => {
        return receivables.filter(r => {
            const matchesSearch =
                (r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.contractTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [receivables, searchTerm, statusFilter]);

    const completedContractsWithoutReceivable = useMemo(() => {
        const completedContractIds = contracts
            .filter(c => c.status === 'Instalação Concluída')
            .map(c => c.id);

        const contractsWithReceivable = new Set(receivables.map(r => r.contractId));

        return contracts.filter(c =>
            c.status === 'Instalação Concluída' && !contractsWithReceivable.has(c.id)
        );
    }, [contracts, receivables]);

    const metrics = useMemo(() => {
        const stats = {
            totalReceived: 0,
            totalPending: 0,
            totalOverdue: 0,
            overdueCount: 0,
            pendingCount: 0,
            receivedCount: 0
        };

        receivables.forEach(r => {
            const contract = contracts.find(c => c.id === r.contractId);
            const value = contract?.value || 0;

            if (r.status === AccountsReceivableStatus.RECEIVED) {
                stats.totalReceived += value;
                stats.receivedCount++;
            } else if (r.status === AccountsReceivableStatus.PENDING) {
                stats.totalPending += value;
                stats.pendingCount++;

                if (r.dueDate && new Date(r.dueDate) < new Date()) {
                    stats.totalOverdue += value;
                    stats.overdueCount++;
                }
            }
        });

        const totalValue = stats.totalReceived + stats.totalPending;
        const collectionRate = totalValue > 0 ? (stats.totalReceived / totalValue * 100).toFixed(1) : '0';

        return { ...stats, collectionRate };
    }, [receivables, contracts]);

    const handleGenerate = async (contractId: string) => {
        try {
            await storage.generateReceivableForContract(contractId);
            onUpdate();
        } catch (error) {
            console.error('Error generating receivable:', error);
            alert('Erro ao gerar conta a receber.');
        }
    };

    const handleUpdateStatus = async (receivable: AccountsReceivable, newStatus: AccountsReceivableStatus) => {
        try {
            await storage.updateAccountsReceivable({ ...receivable, status: newStatus });
            onUpdate();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const StatusBadge = ({ status }: { status: AccountsReceivableStatus }) => {
        const styles = {
            [AccountsReceivableStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
            [AccountsReceivableStatus.RECEIVED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            [AccountsReceivableStatus.CANCELLED]: 'bg-rose-100 text-rose-700 border-rose-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-strong mb-2">Contas a Receber</h2>
                    <p className="text-muted font-medium">Gestão de faturamento e recebimentos</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => ReportService.generateAccountsReceivableReport(receivables, contracts)}
                        className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-brand-primary text-slate-700 px-6 py-4 rounded-2xl font-black transition-all shadow-sm group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">📄</span>
                        <span className="text-xs uppercase tracking-widest">Baixar PDF</span>
                    </button>

                    {completedContractsWithoutReceivable.length > 0 && (
                        <button
                            onClick={() => setIsGenerating(!isGenerating)}
                            className="group flex items-center space-x-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-4 rounded-2xl font-black transition-all shadow-premium"
                        >
                            <span className="text-xl group-hover:rotate-12 transition-transform">💰</span>
                            <span>Sincronizar ({completedContractsWithoutReceivable.length})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Dashboard Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="premium-card p-8 bg-white border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Total Recebido</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs font-black text-emerald-500 mb-1">{metrics.receivedCount} Contratos</p>
                            <p className="text-2xl font-black text-strong leading-none">
                                <span className="text-xs font-black text-muted mr-1">R$</span>
                                {metrics.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl text-emerald-500">📈</div>
                    </div>
                </div>

                <div className="premium-card p-8 bg-white border-l-4 border-l-amber-500">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Total a Receber</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs font-black text-amber-500 mb-1">{metrics.pendingCount} Pendentes</p>
                            <p className="text-2xl font-black text-strong leading-none">
                                <span className="text-xs font-black text-muted mr-1">R$</span>
                                {metrics.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-xl text-amber-500">⏳</div>
                    </div>
                </div>

                <div className="premium-card p-8 bg-white border-l-4 border-l-brand-rose">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Total em Atraso</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs font-black text-brand-rose mb-1">{metrics.overdueCount} Críticos</p>
                            <p className="text-2xl font-black text-strong leading-none">
                                <span className="text-xs font-black text-muted mr-1">R$</span>
                                {metrics.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-xl text-brand-rose">⚠️</div>
                    </div>
                </div>

                <div className="premium-card p-8 bg-gradient-brand-indigo text-white border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4 relative z-10">Insights Estratégicos</p>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-black">{metrics.collectionRate}%</span>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">TAXA REC.</span>
                        </div>
                        <p className="text-[11px] font-medium text-white/80 leading-snug">
                            {metrics.overdueCount > 0
                                ? `Atenção: ${metrics.overdueCount} títulos em atraso impactando o fluxo.`
                                : "Excelente! Nenhuma pendência crítica identificada no momento."}
                        </p>
                    </div>
                </div>
            </div>

            {isGenerating && (
                <div className="glass-panel border-brand-primary/20 p-6 rounded-3xl animate-in zoom-in-95 duration-300">
                    <h3 className="text-lg font-black text-strong mb-4 flex items-center gap-2">
                        <span>✨</span> Contratos Concluídos sem Registro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedContractsWithoutReceivable.map(c => (
                            <div key={c.id} className="bg-white/50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center transition-all hover:border-brand-primary/40">
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm text-strong truncate">{c.title}</p>
                                    <p className="text-xs text-muted">Aguardando registro financeiro</p>
                                </div>
                                <button
                                    onClick={() => handleGenerate(c.id)}
                                    className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                                >
                                    Gerar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass-panel overflow-hidden border-slate-200/60 shadow-xl">
                <div className="p-6 border-b border-slate-100 bg-white/40 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por cliente, contrato ou NF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium text-sm"
                        />
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <span className="text-xs font-black text-muted uppercase tracking-widest hidden md:block">Filtrar:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-sm text-strong"
                        >
                            <option value="all">Todos Status</option>
                            <option value="Pendente">Pendentes</option>
                            <option value="Recebido">Recebidos</option>
                            <option value="Cancelado">Cancelados</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest border-b border-slate-100">Cliente / Contrato</th>
                                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest border-b border-slate-100">NF / Emissão</th>
                                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest border-b border-slate-100">Vencimento</th>
                                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest border-b border-slate-100 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReceivables.map((r) => (
                                <tr key={r.id} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="px-6 py-6">
                                        <p className="font-black text-strong group-hover:text-brand-primary transition-colors">{r.clientName}</p>
                                        <p className="text-xs text-muted font-medium mt-1">{r.contractTitle}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-sm text-strong">{r.invoiceNumber || '---'}</p>
                                        <p className="text-xs text-muted mt-1">{r.issueDate ? new Date(r.issueDate).toLocaleDateString() : '---'}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-strong">
                                                {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '---'}
                                            </span>
                                            {r.status === 'Pendente' && r.dueDate && new Date(r.dueDate) < new Date() && (
                                                <span className="text-[10px] text-rose-500 font-black uppercase mt-1">Atrasado</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <StatusBadge status={r.status} />
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {r.status === 'Pendente' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(r, AccountsReceivableStatus.RECEIVED)}
                                                    className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all"
                                                    title="Marcar como Recebido"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingReceivable(r)}
                                                className="p-2 hover:bg-brand-primary/10 text-brand-primary rounded-xl transition-all"
                                                title="Editar Registro"
                                            >
                                                ✏️
                                            </button>
                                            {currentUser.role === 'admin' && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Deseja excluir este registro de conta a receber?')) {
                                                            await storage.deleteAccountsReceivable(r.id);
                                                            onUpdate();
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-all"
                                                    title="Excluir"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredReceivables.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="text-4xl mb-4">📭</div>
                                        <p className="text-slate-400 font-bold">Nenhum registro encontrado</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingReceivable && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-premium animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black text-strong mb-6 flex items-center gap-3">
                            <span>📝</span> Editar Conta a Receber
                        </h3>

                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            await storage.updateAccountsReceivable(editingReceivable);
                            setEditingReceivable(null);
                            onUpdate();
                        }}>
                            <div>
                                <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Número da Nota Fiscal</label>
                                <input
                                    type="text"
                                    value={editingReceivable.invoiceNumber || ''}
                                    onChange={e => setEditingReceivable({ ...editingReceivable, invoiceNumber: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-bold"
                                    placeholder="NF-0000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Data de Emissão</label>
                                    <input
                                        type="date"
                                        value={editingReceivable.issueDate || ''}
                                        onChange={e => setEditingReceivable({ ...editingReceivable, issueDate: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Previsão de Recebimento</label>
                                    <input
                                        type="date"
                                        value={editingReceivable.dueDate || ''}
                                        onChange={e => setEditingReceivable({ ...editingReceivable, dueDate: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Status</label>
                                <select
                                    value={editingReceivable.status}
                                    onChange={e => setEditingReceivable({ ...editingReceivable, status: e.target.value as AccountsReceivableStatus })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-bold"
                                >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Recebido">Recebido</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Observações</label>
                                <textarea
                                    value={editingReceivable.observations || ''}
                                    onChange={e => setEditingReceivable({ ...editingReceivable, observations: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-medium h-24 ring-0 resize-none"
                                />
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingReceivable(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-primary/90 shadow-premium transition-all"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsReceivableManager;
