
import React from 'react';
import { Client, Contract, ContractStatus } from '../types';

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <p className="text-slate-500">Estatísticas e alertas importantes do sistema.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-tight">Total de Clientes</span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-slate-900">{clients.length}</span>
            <span className="text-emerald-500 text-sm mb-1 font-medium">Cadastrados</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-tight">Contratos Ativos</span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-slate-900">{activeContracts}</span>
            <span className="text-blue-500 text-sm mb-1 font-medium">em execução</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-tight">Valor em Carteira</span>
          <div className="flex items-end space-x-1">
            <span className="text-xl font-bold text-slate-900">R$</span>
            <span className="text-3xl font-bold text-slate-900">
              {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-tight">Instalações Pendentes</span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-slate-900">{pendingContracts}</span>
            <span className="text-amber-500 text-sm mb-1 font-medium">aguardando</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <span className="mr-2 text-rose-500">⚠️</span>
            Alertas de Instalação (Próximos 15 dias)
          </h3>
          {approachingDeadlines.length > 0 ? (
            <div className="space-y-4">
              {approachingDeadlines.map(contract => (
                <div key={contract.id} className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-rose-900">{contract.title}</p>
                    <p className="text-sm text-rose-700">Prazo: {new Date(contract.estimatedInstallationDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className="px-3 py-1 bg-rose-200 text-rose-800 rounded-full text-xs font-bold uppercase">Urgente</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400">Nenhum prazo crítico detectado no momento.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <span className="mr-2 text-emerald-500">✨</span>
            Clientes Recentes
          </h3>
          <div className="space-y-4">
            {clients.slice(-5).reverse().map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{client.name}</p>
                    <p className="text-xs text-slate-500">{client.cnpj}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
            {clients.length === 0 && <p className="text-center py-10 text-slate-400">Nenhum cliente cadastrado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
