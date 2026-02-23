import React from 'react';
import { Client, Contract } from '../types';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DashboardProps {
  clients: Client[];
  contracts: Contract[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, contracts }) => {
  const {
    activeContractsCount,
    pendingContractsCount,
    totalValue,
    annualValue,
    elevatorsInstalled,
    elevatorsContracted,
    platformsInstalled,
    platformsContracted,
    totalInstalled,
    totalContracted,
    approachingDeadlines,
    insights,
    currentYear
  } = useDashboardStats(clients, contracts);

  const [showAlerts, setShowAlerts] = React.useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-strong">
            Dashboard de <span className="text-gradient-indigo">Gestão</span>
          </h2>
          <p className="text-muted font-medium">Controle detalhado de unidades vendidas vs. instaladas</p>
        </div>
      </header>

      {/* Grid de Métricas principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="premium-card flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-subtle text-xs font-black uppercase tracking-widest">Faturamento {currentYear}</span>
            <span className="text-brand-primary text-xl group-hover:scale-110 transition-transform">📈</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-strong">
              <span className="text-sm text-muted mr-1">R$</span>
              {annualValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="premium-card flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-subtle text-xs font-black uppercase tracking-widest">Elevadores Instalados</span>
            <span className="text-brand-indigo text-xl group-hover:scale-110 transition-transform">📊</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-strong">{elevatorsInstalled}</p>
            <p className="text-xs font-bold text-muted mt-2 uppercase tracking-wide">
              de {elevatorsContracted} contratados
            </p>
          </div>
        </div>

        <div className="premium-card flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-subtle text-xs font-black uppercase tracking-widest">Plataformas Instaladas</span>
            <span className="text-brand-indigo text-xl group-hover:scale-110 transition-transform">📉</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-strong">{platformsInstalled}</p>
            <p className="text-xs font-bold text-muted mt-2 uppercase tracking-wide">
              de {platformsContracted} contratadas
            </p>
          </div>
        </div>

        <div className="premium-card bg-brand-amber/5 border-brand-amber/20 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-brand-amber text-xs font-black uppercase tracking-widest">Contratos Pendentes</span>
            <span className="text-xl group-hover:rotate-12 transition-transform">⏲️</span>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-black text-strong">{pendingContractsCount}</p>
          </div>
        </div>
      </div>

      {/* Grid Secundária */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card Movido para o Início para Garantir Visibilidade */}
        <div className="premium-card flex flex-col justify-between group h-full transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest">
              Total Instalado
            </h4>
            <span className="text-emerald-500 text-xl group-hover:scale-110 transition-transform">✅</span>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-black text-slate-900 leading-none">
              {totalInstalled}
            </p>
            <div className="text-xs font-bold text-slate-500 mt-4 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
              Unidades entregues
            </div>
          </div>
        </div>

        <div className="premium-card flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-subtle text-xs font-black uppercase tracking-widest">Faturamento Global</span>
            <span className="text-brand-indigo/60 text-xl group-hover:scale-110 transition-transform">🛍️</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-strong">
              <span className="text-sm text-muted mr-1 uppercase">R$</span>
              {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="premium-card flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-subtle text-xs font-black uppercase tracking-widest">Contratos Ativos</span>
            <span className="text-brand-emerald text-xl group-hover:scale-110 transition-transform">◎</span>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-black text-strong">{activeContractsCount}</p>
          </div>
        </div>

        <div className="premium-card flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-subtle text-xs font-black uppercase tracking-widest">Total Comercializado</span>
            <span className="text-brand-indigo text-xl group-hover:scale-110 transition-transform">📦</span>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-black text-strong">{totalContracted}</p>
            <p className="text-xs font-bold text-muted mt-2 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-2" /> Unidades vendidas
            </p>
          </div>
        </div>
      </div>

      {/* Seção de Insights Estratégicos */}
      <section className="bg-slate-900 p-8 lg:p-12 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[120px] -ml-48 -mb-48" />

        <div className="relative z-10">
          <header className="mb-8">
            <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">Insights Estratégicos</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Inteligência de dados aplicada ao negócio</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.03] ${insight.status === 'warning' ? 'bg-brand-amber/5 border-brand-amber/10' :
                  insight.status === 'danger' ? 'bg-brand-rose/5 border-brand-rose/10' :
                    insight.status === 'success' ? 'bg-brand-emerald/5 border-brand-emerald/10' :
                      'bg-brand-primary/5 border-brand-primary/10'
                  }`}
              >
                <div className="flex items-center space-x-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-slate-700/50">
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{insight.title}</h4>
                    <p className={`text-xl font-black mt-1 ${insight.status === 'warning' ? 'text-brand-amber' :
                      insight.status === 'danger' ? 'text-brand-rose' :
                        insight.status === 'success' ? 'text-brand-emerald' :
                          'text-brand-primary-light'
                      }`}>
                      {insight.value}
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Portal */}
      {showAlerts && approachingDeadlines.length > 0 && (
        <div className="fixed bottom-8 right-8 z-[100] w-[calc(100vw-4rem)] md:w-96 animate-in slide-in-from-right-10 duration-500">
          <div className="glass-panel p-8 rounded-[2.5rem] border-brand-amber/20 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber/5 rounded-full blur-3xl" />

            <header className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-amber rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-brand-amber/20">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-black text-strong text-base">Prazos Críticos</h4>
                  <p className="text-xs text-muted font-bold uppercase tracking-widest">{approachingDeadlines.length} Contratos</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlerts(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-subtle hover:text-strong transition-all"
              >
                &times;
              </button>
            </header>

            <div className="space-y-3 relative z-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {approachingDeadlines.map(contract => (
                <div key={contract.id} className="p-4 bg-white/50 border border-border-default rounded-2xl hover:border-brand-amber/30 transition-all group">
                  <p className="font-bold text-strong text-xs mb-1 truncate">{contract.title}</p>
                  <p className="text-[10px] font-black text-brand-rose uppercase tracking-widest">
                    Entrega: {new Date(contract.estimatedInstallationDate || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAlerts(false)}
              className="btn-primary w-full mt-6 text-xs uppercase tracking-widest"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
