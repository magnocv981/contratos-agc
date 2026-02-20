
import React, { useState, useEffect } from 'react';
import { Client, Contract, ContractStatus } from '../types';

interface ContractManagerProps {
  contracts: Contract[];
  clients: Client[];
  onAdd: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  forceOpenWithClientId?: string;
  onCloseForceOpen?: () => void;
}

const ContractManager: React.FC<ContractManagerProps> = ({ 
  contracts, 
  clients, 
  onAdd, 
  onEdit, 
  onDelete, 
  forceOpenWithClientId, 
  onCloseForceOpen 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<Partial<Contract>>({
    title: '',
    clientId: '',
    platformContracted: 0,
    platformInstalled: 0,
    elevatorContracted: 0,
    elevatorInstalled: 0,
    value: 0,
    startDate: '',
    endDate: '',
    installationAddress: '',
    estimatedInstallationDate: '',
    status: ContractStatus.PENDING,
    observations: '',
    warranty: undefined
  });

  useEffect(() => {
    if (forceOpenWithClientId) {
      handleOpenModal(undefined, forceOpenWithClientId);
      onCloseForceOpen?.();
    }
  }, [forceOpenWithClientId]);

  const handleOpenModal = (contract?: Contract, prefilledClientId?: string) => {
    if (contract) {
      setEditingContract(contract);
      setFormData(contract);
    } else {
      setEditingContract(null);
      setFormData({
        title: '',
        clientId: prefilledClientId || '',
        platformContracted: 0,
        platformInstalled: 0,
        elevatorContracted: 0,
        elevatorInstalled: 0,
        value: 0,
        startDate: '',
        endDate: '',
        installationAddress: '',
        estimatedInstallationDate: '',
        status: ContractStatus.PENDING,
        observations: '',
        warranty: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };

    // Automatic logic for "Completed" status -> Warranty
    if (dataToSave.status === ContractStatus.COMPLETED && !dataToSave.warranty) {
      dataToSave.warranty = {
        completionDate: new Date().toISOString().split('T')[0],
        warrantyDays: 365
      };
    }

    if (editingContract) {
      onEdit({ ...editingContract, ...dataToSave } as Contract);
    } else {
      const newContract: Contract = {
        ...dataToSave as Contract,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      onAdd(newContract);
    }
    setIsModalOpen(false);
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Desconhecido';

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case ContractStatus.ACTIVE: return 'bg-blue-100 text-blue-800';
      case ContractStatus.COMPLETED: return 'bg-emerald-100 text-emerald-800';
      case ContractStatus.CLOSED: return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Contratos</h2>
          <p className="text-slate-500">Acompanhamento de prazos, instalações e garantias.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center transition-all shadow-lg"
        >
          <span className="mr-2 text-xl">+</span>
          Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contracts.map((contract) => {
          const deadline = new Date(contract.estimatedInstallationDate);
          const diffDays = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = diffDays <= 15 && diffDays >= 0 && contract.status !== ContractStatus.COMPLETED && contract.status !== ContractStatus.CLOSED;

          return (
            <div key={contract.id} className={`bg-white rounded-2xl shadow-sm border ${isUrgent ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100'} p-6 transition-all hover:shadow-md relative overflow-hidden`}>
              {isUrgent && (
                <div className="absolute top-0 right-0 px-4 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl shadow-sm">
                  Prazo Crítico
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">{contract.title}</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    <span className="text-emerald-600 font-bold">{getClientName(contract.clientId)}</span> • ID: {contract.id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-right pr-4 border-r border-slate-100 hidden md:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Plataformas</p>
                    <p className="font-bold text-slate-700">{contract.platformInstalled}/{contract.platformContracted}</p>
                  </div>
                  <div className="text-right pr-4 border-r border-slate-100 hidden md:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Elevadores</p>
                    <p className="font-bold text-slate-700">{contract.elevatorInstalled}/{contract.elevatorContracted}</p>
                  </div>
                  <div className="text-right pr-4 border-r border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Valor</p>
                    <p className="font-bold text-slate-900">R$ {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(contract)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                    <button onClick={() => onDelete(contract.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">🗑️</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col md:flex-row gap-4 md:gap-10">
                <div className="text-sm">
                  <span className="text-slate-400 font-medium">Prazo Instalação:</span>
                  <span className={`ml-2 font-bold ${isUrgent ? 'text-rose-600' : 'text-slate-600'}`}>
                    {new Date(contract.estimatedInstallationDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400 font-medium">Fim do Contrato:</span>
                  <span className="ml-2 font-bold text-slate-600">
                    {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {contract.warranty && (
                  <div className="text-sm">
                    <span className="text-emerald-500 font-medium">Garantia Ativa:</span>
                    <span className="ml-2 font-bold text-emerald-700">Até {new Date(new Date(contract.warranty.completionDate).getTime() + (contract.warranty.warrantyDays * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {contracts.length === 0 && (
          <div className="bg-white p-20 text-center rounded-2xl border border-slate-100">
            <p className="text-slate-400 italic">Nenhum contrato ativo no sistema.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-8">
              <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingContract ? 'Editar Contrato' : 'Novo Registro de Contrato'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  &times;
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Título / Nome do Contrato</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ex: Contrato de Manutenção - Prefeitura Municipal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Cliente Associado</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500">Plataformas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600">Contratada</label>
                      <input type="number" value={formData.platformContracted} onChange={e => setFormData({...formData, platformContracted: Number(e.target.value)})} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600">Instalada</label>
                      <input type="number" value={formData.platformInstalled} onChange={e => setFormData({...formData, platformInstalled: Number(e.target.value)})} className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500">Elevadores</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600">Contratada</label>
                      <input type="number" value={formData.elevatorContracted} onChange={e => setFormData({...formData, elevatorContracted: Number(e.target.value)})} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600">Instalada</label>
                      <input type="number" value={formData.elevatorInstalled} onChange={e => setFormData({...formData, elevatorInstalled: Number(e.target.value)})} className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500">Financeiro</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Valor do Contrato (R$)</label>
                    <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full p-2 border rounded-lg font-bold text-emerald-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Data Inicial</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Data de Encerramento</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Status do Contrato</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value={ContractStatus.PENDING}>Pendente</option>
                    <option value={ContractStatus.ACTIVE}>Ativo</option>
                    <option value={ContractStatus.COMPLETED}>Instalação Concluída</option>
                    <option value={ContractStatus.CLOSED}>Encerrado</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Endereço de Instalação</label>
                  <input type="text" value={formData.installationAddress} onChange={e => setFormData({...formData, installationAddress: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Prazo para Instalação</label>
                  <input type="date" value={formData.estimatedInstallationDate} onChange={e => setFormData({...formData, estimatedInstallationDate: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Observações & Histórico</label>
                  <textarea
                    rows={4}
                    value={formData.observations}
                    onChange={e => setFormData({...formData, observations: e.target.value})}
                    placeholder="Registre eventos, contatos e datas importantes aqui..."
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {formData.status === ContractStatus.COMPLETED && (
                  <div className="md:col-span-3 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="font-bold text-emerald-800">Controle de Garantia</h4>
                      <p className="text-xs text-emerald-600">Preencha os dados da garantia para este contrato concluído.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-emerald-800">Conclusão da Instalação</label>
                        <input 
                          type="date" 
                          value={formData.warranty?.completionDate || ''} 
                          onChange={e => setFormData({
                            ...formData, 
                            warranty: { 
                              completionDate: e.target.value, 
                              warrantyDays: formData.warranty?.warrantyDays || 365 
                            }
                          })} 
                          className="w-full p-2 border border-emerald-200 rounded-lg text-emerald-900" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-emerald-800">Dias de Cobertura</label>
                        <input 
                          type="number" 
                          value={formData.warranty?.warrantyDays || 365} 
                          onChange={e => setFormData({
                            ...formData, 
                            warranty: { 
                              completionDate: formData.warranty?.completionDate || '', 
                              warrantyDays: Number(e.target.value) 
                            }
                          })} 
                          className="w-full p-2 border border-emerald-200 rounded-lg text-emerald-900" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-all"
                >
                  Salvar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManager;
