import React, { useState } from 'react';
import { Client, Contract } from '../types';
import { ReportService } from '../services/reports';

interface ReportManagerProps {
    contracts: Contract[];
    clients: Client[];
}

const ReportManager: React.FC<ReportManagerProps> = ({ contracts, clients }) => {
    const [activeReport, setActiveReport] = useState<'year' | 'state'>('year');

    // Helper to aggregate data by year
    const getSalesByYear = () => {
        const stats: Record<string, { plat: number, elev: number, val: number }> = {};
        contracts.forEach(c => {
            const year = c.startDate ? new Date(c.startDate).getFullYear().toString() : 'N/D';
            if (!stats[year]) stats[year] = { plat: 0, elev: 0, val: 0 };
            stats[year].plat += (c.platformContracted || 0);
            stats[year].elev += (c.elevatorContracted || 0);
            stats[year].val += (c.value || 0);
        });
        return Object.keys(stats).sort((a, b) => b.localeCompare(a)).map(yr => ({
            label: yr,
            ...stats[yr]
        }));
    };

    // Helper to aggregate data by state
    const getSalesByState = () => {
        const stats: Record<string, { plat: number, elev: number, val: number }> = {};
        contracts.forEach(c => {
            const client = clients.find(cl => cl.id === c.clientId);
            const state = client?.address?.state || 'N/D';
            if (!stats[state]) stats[state] = { plat: 0, elev: 0, val: 0 };
            stats[state].plat += (c.platformContracted || 0);
            stats[state].elev += (c.elevatorContracted || 0);
            stats[state].val += (c.value || 0);
        });
        return Object.keys(stats).sort().map(st => ({
            label: st,
            ...stats[st]
        }));
    };

    const yearData = getSalesByYear();
    const stateData = getSalesByState();

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Relatórios & Inteligência</h2>
                    <p className="text-lg md:text-xl text-slate-500 font-medium">Análise consolidada de performance comercial e regional.</p>
                </div>

                <div className="flex bg-white/50 p-1 rounded-2xl border border-slate-300 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveReport('year')}
                        className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeReport === 'year' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Por Ano
                    </button>
                    <button
                        onClick={() => setActiveReport('state')}
                        className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeReport === 'state' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Por Estado
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visualização de Dados */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-300 p-10 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h3 className="text-2xl font-black text-slate-800">
                            {activeReport === 'year' ? 'Volumes de Vendas Anuais' : 'Distribuição por Unidade Federativa'}
                        </h3>
                        <button
                            onClick={() => activeReport === 'year' ? ReportService.generateSalesByYear(contracts) : ReportService.generateSalesByState(contracts, clients)}
                            className="px-6 py-3 bg-white border border-slate-300 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center"
                        >
                            <span className="mr-2">📥</span> Baixar PDF
                        </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {(activeReport === 'year' ? yearData : stateData).map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                                        <p className="text-sm font-bold text-slate-700">Total: {item.plat + item.elev} unidades</p>
                                    </div>
                                    {activeReport === 'year' && (
                                        <span className="text-sm font-black text-indigo-600">R$ {item.val?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    )}
                                </div>

                                <div className="flex space-x-1 h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(item.plat / (item.plat + item.elev || 1)) * 100}%` }}
                                        title={`Plataformas: ${item.plat}`}
                                    />
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(item.elev / (item.plat + item.elev || 1)) * 100}%` }}
                                        title={`Elevadores: ${item.elev}`}
                                    />
                                </div>

                                <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-indigo-500 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5" /> {item.plat} Plataformas
                                    </span>
                                    <span className="text-emerald-500 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" /> {item.elev} Elevadores
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumo Dinâmico */}
                <div className="space-y-6 md:space-y-8">
                    <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Insight Estratégico</h4>
                        <p className="text-xl md:text-2xl font-light leading-relaxed text-indigo-100">
                            O volume acumulado de <span className="font-black text-white italic">Plataformas</span> representa hoje <span className="text-indigo-400 font-bold">
                                {Math.round((contracts.reduce((acc, c) => acc + c.platformContracted, 0) / (contracts.reduce((acc, c) => acc + c.platformContracted + c.elevatorContracted, 0) || 1)) * 100)}%
                            </span> da demanda total do sistema.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white/60 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-300">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-4">Total Plataformas</span>
                            <p className="text-2xl md:text-3xl font-black text-slate-900">{contracts.reduce((acc, c) => acc + c.platformContracted, 0)}</p>
                        </div>
                        <div className="bg-white/60 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-300">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-4">Total Elevadores</span>
                            <p className="text-2xl md:text-3xl font-black text-slate-900">{contracts.reduce((acc, c) => acc + c.elevatorContracted, 0)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportManager;
