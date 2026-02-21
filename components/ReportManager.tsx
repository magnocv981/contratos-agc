import React, { useState } from 'react';
import { Client, Contract } from '../types';
import { ReportService } from '../services/reports';

interface ReportManagerProps {
    contracts: Contract[];
    clients: Client[];
}

const ReportManager: React.FC<ReportManagerProps> = ({ contracts, clients }) => {
    const [activeReport, setActiveReport] = useState<'year' | 'state'>('year');

    const getSalesByYear = () => {
        const stats: Record<string, { plat: number, elev: number, val: number }> = {};
        contracts.forEach(c => {
            const year = c.startDate ? new Date(c.startDate).getFullYear().toString() : 'Externo';
            if (!stats[year]) stats[year] = { plat: 0, elev: 0, val: 0 };
            stats[year].plat += (c.platformContracted || 0);
            stats[year].elev += (c.elevatorContracted || 0);
            stats[year].val += (c.value || 0);
        });
        return Object.keys(stats).sort((a, b) => b.localeCompare(a)).map(yr => ({ label: yr, ...stats[yr] }));
    };

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
        return Object.keys(stats).sort().map(st => ({ label: st, ...stats[st] }));
    };

    const yearData = getSalesByYear();
    const stateData = getSalesByState();

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-strong">
                        Relatórios & <span className="text-gradient-indigo">Inteligência</span>
                    </h2>
                    <p className="text-muted font-medium">Consolidação tática de performance comercial e regional</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-border-default shadow-inner">
                    <button
                        onClick={() => setActiveReport('year')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeReport === 'year' ? 'bg-white text-brand-primary shadow-sm' : 'text-subtle hover:text-strong'}`}
                    >
                        Análise Anual
                    </button>
                    <button
                        onClick={() => setActiveReport('state')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeReport === 'state' ? 'bg-white text-brand-primary shadow-sm' : 'text-subtle hover:text-strong'}`}
                    >
                        Visão Regional
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="premium-card p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/[0.03] rounded-full blur-[100px] -mr-40 -mt-40" />

                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <h3 className="text-2xl font-black text-strong tracking-tight">
                            {activeReport === 'year' ? 'Performance Contratual Anual' : 'Distribuição Regional (UF)'}
                        </h3>
                        <button
                            onClick={() => activeReport === 'year' ? ReportService.generateSalesByYear(contracts) : ReportService.generateSalesByState(contracts, clients)}
                            className="btn-primary px-6 py-3 bg-white border border-border-default !text-subtle hover:!text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center"
                        >
                            <span className="mr-2">📥</span> Gravar PDF
                        </button>
                    </div>

                    <div className="space-y-10 relative z-10">
                        {(activeReport === 'year' ? yearData : stateData).map((item, idx) => (
                            <div key={idx} className="group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <span className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1 block">{item.label}</span>
                                        <p className="text-base font-black text-strong">{item.plat + item.elev} <span className="text-[10px] font-medium text-muted uppercase">Unidades Totais</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-brand-primary">
                                            <span className="text-[10px] font-medium mr-1 tracking-tight">R$</span>
                                            {item.val?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-border-default/20">
                                    <div
                                        className="bg-brand-primary h-full transition-all duration-1000 ease-out shadow-indigo"
                                        style={{ width: `${(item.plat / (item.plat + item.elev || 1)) * 100}%` }}
                                        title={`Plataformas: ${item.plat}`}
                                    />
                                    <div
                                        className="bg-brand-emerald h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(item.elev / (item.plat + item.elev || 1)) * 100}%` }}
                                        title={`Elevadores: ${item.elev}`}
                                    />
                                </div>

                                <div className="flex justify-between mt-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
                                    <span className="flex items-center text-brand-primary">
                                        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mr-2" /> {item.plat} Plats
                                    </span>
                                    <span className="flex items-center text-brand-emerald">
                                        <div className="w-1.5 h-1.5 bg-brand-emerald rounded-full mr-2" /> {item.elev} Elevs
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-premium relative overflow-hidden group border border-slate-800">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-8 ml-1">Relatório Cognitivo</h4>
                        <p className="text-2xl font-light leading-relaxed text-slate-200">
                            A concentração comercial em <span className="font-black text-white italic">Plataformas de Acessibilidade</span> atinge <span className="text-brand-primary font-black text-3xl mx-1">
                                {Math.round((contracts.reduce((acc, c) => acc + c.platformContracted, 0) / (contracts.reduce((acc, c) => acc + c.platformContracted + c.elevatorContracted, 0) || 1)) * 100)}%
                            </span> do volume total de ativos gerenciados localmente.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="premium-card p-10 flex flex-col justify-between group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/[0.02] rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
                            <span className="text-[9px] font-black text-subtle uppercase tracking-widest block mb-6">Demanda Global Plats</span>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-strong">{contracts.reduce((acc, c) => acc + c.platformContracted, 0)}</p>
                                <span className="text-brand-primary text-xl">🏗️</span>
                            </div>
                        </div>
                        <div className="premium-card p-10 flex flex-col justify-between group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/[0.02] rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
                            <span className="text-[9px] font-black text-subtle uppercase tracking-widest block mb-6">Demanda Global Elevs</span>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-strong">{contracts.reduce((acc, c) => acc + c.elevatorContracted, 0)}</p>
                                <span className="text-brand-emerald text-xl">🏙️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportManager;
