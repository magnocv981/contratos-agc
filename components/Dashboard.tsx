import React from 'react';
import { Client, Contract, ContractStatus } from '../types';
import { ReportService } from '../services/reports';

interface DashboardProps {
  clients: Client[];
  contracts: Contract[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, contracts }) => {
  const activeContracts = contracts.filter(c => c.status === ContractStatus.ACTIVE).length;
  const pendingContracts = contracts.filter(c => c.status === ContractStatus.PENDING).length;
  const totalValue = contracts.reduce((acc, c) => acc + c.value, 0);

  const approachingDeadlines = contracts.filter(c => {
    if (c.status === ContractStatus.CLOSED || c.status === ContractStatus.COMPLETED) return false;
    const deadline = new Date(c.estimatedInstallationDate);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 15 && diffDays >= 0;
  });

  const currentYear = new Date().getFullYear();
  const annualValue = contracts
    .filter(c => new Date(c.startDate).getFullYear() === currentYear)
    .reduce((acc, c) => acc + c.value, 0);

  const elevatorsInstalled = contracts.reduce((acc, c) => acc + c.elevatorInstalled, 0);
  const elevatorsContracted = contracts.reduce((acc, c) => acc + c.elevatorContracted, 0);

  const platformsInstalled = contracts.reduce((acc, c) => acc + c.platformInstalled, 0);
  const platformsContracted = contracts.reduce((acc, c) => acc + c.platformContracted, 0);

  const totalInstalled = contracts.reduce((acc, c) => acc + c.platformInstalled + c.elevatorInstalled, 0);
  const totalContracted = contracts.reduce((acc, c) => acc + c.platformContracted + c.elevatorContracted, 0);

  const [showAlerts, setShowAlerts] = React.useState(true);

  // Cálculos para Insights Estratégicos
  const installationRate = totalContracted > 0 ? (totalInstalled / totalContracted) * 100 : 0;
  const criticalContracts = approachingDeadlines.length;
  const growthRate = totalValue > annualValue && annualValue > 0 ? ((totalValue - annualValue) / annualValue) * 100 : 0;

  const insights = [
    {
      title: 'Eficiência de Entrega',
      value: `${installationRate.toFixed(1)}%`,
      description: installationRate < 50 ? 'Ritmo de instalação abaixo da meta. Considere reforçar a equipe técnica.' : 'Excelente ritmo de conclusão. Pipeline saudável.',
      status: installationRate < 50 ? 'warning' : 'success',
      icon: '⚙️'
    },
    {
      title: 'Risco Operacional',
      value: criticalContracts > 0 ? 'Atenção' : 'Baixo',
      description: criticalContracts > 0 ? `${criticalContracts} contratos com prazos críticos. Risco de multa contratual.` : 'Sem gargalos de prazo detectados para os próximos 15 dias.',
      status: criticalContracts > 0 ? 'danger' : 'success',
      icon: '🚨'
    },
    {
      title: 'Potencial de Expansão',
      value: `${growthRate.toFixed(1)}%`,
      description: 'Crescimento do portfólio em relação ao faturamento base anual.',
      status: 'info',
      icon: '🚀'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-1 space-y-2 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">Dashboard de Gestão</h2>
          <p className="text-[10px] md:text-sm lg:text-base text-slate-500 font-medium">Controle detalhado de unidades vendidas vs. instaladas</p>
        </div>
      </header>

      {/* Grid de Métricas principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white/60 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-slate-300 flex flex-col justify-between group hover:border-indigo-500/20 transition-all shadow-sm backdrop-blur-md">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Faturamento {currentYear}</span>
            <span className="text-indigo-500 text-lg lg:text-xl group-hover:scale-110 transition-transform">📈</span>
          </div>
          <div>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900">
              <span className="text-xs md:text-sm text-slate-600 mr-1 italic">R$</span>
              {annualValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white/60 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Elevadores Instalados</span>
            <span className="text-indigo-500 text-lg lg:text-xl">📊</span>
          </div>
          <div>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900">{elevatorsInstalled}</p>
            <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-600 mt-2">de {elevatorsContracted} contratados</p>
          </div>
        </div>

        <div className="bg-white/60 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Plataformas Instaladas</span>
            <span className="text-indigo-500 text-lg lg:text-xl">📉</span>
          </div>
          <div>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900">{platformsInstalled}</p>
            <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-600 mt-2">de {platformsContracted} contratadas</p>
          </div>
        </div>

        <div className="bg-white/30 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-slate-300 flex flex-col justify-between shadow-sm backdrop-blur-md">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Contratos Pendentes</span>
            <span className="text-amber-500 text-lg lg:text-xl">⏲️</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">{pendingContracts}</p>
          </div>
        </div>
      </div>

      {/* Grid Secundária com o Card Verde de Destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white/60 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Faturamento Global</span>
            <span className="text-indigo-400 text-lg lg:text-xl">🛍️</span>
          </div>
          <div>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900">
              <span className="text-xs md:text-sm text-slate-600 mr-2 uppercase">R$</span>
              {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white/60 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Contratos Ativos</span>
            <span className="text-emerald-500 text-lg font-black lg:text-xl">◎</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">{activeContracts}</p>
          </div>
        </div>

        <div className="bg-white/60 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Total Contratado (Vendido)</span>
            <span className="text-indigo-500 text-lg lg:text-xl">📦</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">{totalContracted}</p>
            <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-600 mt-2 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-2" /> Unidades em contrato
            </p>
          </div>
        </div>

        <div className="bg-emerald-600 p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(5,150,105,0.15)] flex flex-col justify-between relative overflow-hidden group border border-emerald-500 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

          <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
            <span className="text-emerald-100 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em]">Total Geral Instalado</span>
            <span className="text-white text-lg lg:text-xl">✅</span>
          </div>
          <div className="relative z-10">
            <p className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter">{totalInstalled}</p>
            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-emerald-100/70 mt-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-white/40 mr-2 animate-pulse" /> Total de Unidades Instaladas
            </p>
          </div>
        </div>
      </div>

      {/* Seção de Insights Estratégicos */}
      <section className="bg-slate-900 p-5 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -ml-48 -mb-48" />

        <div className="relative z-10">
          <header className="mb-4 md:mb-6 lg:mb-8">
            <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white tracking-tight uppercase">Insights Estratégicos</h3>
            <p className="text-slate-500 lg:text-[10px] font-bold uppercase tracking-widest text-[8px] md:text-[9px] mt-1.5">Inteligência de dados aplicada ao negócio</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl border transition-all duration-500 hover:scale-[1.03] ${insight.status === 'warning' ? 'bg-amber-500/5 border-amber-500/10' :
                  insight.status === 'danger' ? 'bg-rose-500/5 border-rose-500/10' :
                    insight.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/10' :
                      'bg-indigo-500/5 border-indigo-500/10'
                  }`}
              >
                <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-5">
                  <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg md:text-xl shadow-inner">
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em]">{insight.title}</h4>
                    <p className={`text-base md:text-lg lg:text-xl font-black mt-1 ${insight.status === 'warning' ? 'text-amber-400' :
                      insight.status === 'danger' ? 'text-rose-400' :
                        insight.status === 'success' ? 'text-emerald-400' :
                          'text-indigo-400'
                      }`}>
                      {insight.value}
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-[10px] md:text-xs lg:text-sm font-medium leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Notifications */}
      {showAlerts && approachingDeadlines.length > 0 && (
        <div className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-[100] w-[calc(100vw-2rem)] md:w-96 animate-in slide-in-from-right-10 duration-500">
          <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-orange-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />

            <header className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-200">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Prazos Críticos</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{approachingDeadlines.length} Contratos</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlerts(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
              >
                &times;
              </button>
            </header>

            <div className="space-y-3 relative z-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {approachingDeadlines.map(contract => (
                <div key={contract.id} className="p-4 bg-white/50 border border-slate-100 rounded-2xl hover:border-orange-200 transition-all group">
                  <p className="font-bold text-slate-800 text-xs mb-1 truncate">{contract.title}</p>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                    Vence: {new Date(contract.estimatedInstallationDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAlerts(false)}
              className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-lg"
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
