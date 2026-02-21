
import React, { useState, useEffect } from 'react';
import { Client, Contract, ContractStatus, User } from '../types';

interface ContractManagerProps {
  contracts: Contract[];
  clients: Client[];
  currentUser: User;
  onAdd: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete?: (id: string) => void;
  forceOpenWithClientId?: string;
  onCloseForceOpen?: () => void;
}

const ContractManager: React.FC<ContractManagerProps> = ({
  contracts,
  clients,
  currentUser,
  onAdd,
  onEdit,
  onDelete,
  forceOpenWithClientId,
  onCloseForceOpen
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
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

  const handleOpenModal = (contract?: Contract, prefilledClientId?: string, viewOnly = false) => {
    setIsViewOnly(viewOnly);
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

    // Sanitize and validate - no negative values allowed
    const sanitizedData = {
      ...formData,
      platformContracted: Math.max(0, formData.platformContracted || 0),
      platformInstalled: Math.max(0, formData.platformInstalled || 0),
      elevatorContracted: Math.max(0, formData.elevatorContracted || 0),
      elevatorInstalled: Math.max(0, formData.elevatorInstalled || 0),
      value: Math.max(0, formData.value || 0),
      warranty: formData.warranty ? {
        ...formData.warranty,
        warrantyDays: Math.max(0, formData.warranty.warrantyDays || 0)
      } : undefined
    };

    const dataToSave = { ...sanitizedData };

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
    <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Fluxo de Contratos</h2>
          <p className="text-base md:text-lg text-slate-500 font-medium">Controle rigoroso de instalações, valores e termos contratuais.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="mr-2 text-xl">+</span>
          Gerar Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {contracts.map((contract) => {
          const deadline = new Date(contract.estimatedInstallationDate);
          const diffDays = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = diffDays <= 15 && diffDays >= 0 && contract.status !== ContractStatus.COMPLETED && contract.status !== ContractStatus.CLOSED;

          return (
            <div key={contract.id} className={`bg-white/60 backdrop-blur-xl rounded-2xl md:rounded-3xl border ${isUrgent ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-300'} p-4 md:p-6 transition-all hover:border-indigo-200 group relative overflow-hidden shadow-xl`}>
              {isUrgent && (
                <div className="absolute top-0 right-0 px-3 md:px-4 py-0.5 md:py-1 bg-rose-600 text-white text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-xl shadow-lg animate-pulse">
                  Prioridade Crítica
                </div>
              )}

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 md:gap-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-3">
                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${contract.status === ContractStatus.ACTIVE ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                      contract.status === ContractStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                      {contract.status}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{contract.id}</span>
                  </div>
                  <button
                    onClick={() => handleOpenModal(contract, undefined, true)}
                    className="text-left group/title block"
                  >
                    <h3 className="text-base md:text-lg font-black text-slate-900 group-hover/title:text-indigo-600 transition-colors uppercase tracking-tight">{contract.title}</h3>
                  </button>
                  <div className="flex items-center mt-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-500 mr-2" />
                    <span className="font-bold uppercase tracking-tight text-[10px] md:text-xs">{getClientName(contract.clientId)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6 bg-slate-100/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-300/50">
                  <div className="text-left sm:pr-6 md:pr-8 sm:border-r border-slate-300">
                    <p className="text-[8px] md:text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Equipamentos</p>
                    <div className="flex sm:flex-col gap-x-4 gap-y-0.5">
                      <p className="text-[10px] md:text-xs font-bold text-slate-500">Plat: <span className="text-slate-900">{contract.platformInstalled}/{contract.platformContracted}</span></p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500">Elev: <span className="text-slate-900">{contract.elevatorInstalled}/{contract.elevatorContracted}</span></p>
                    </div>
                  </div>

                  <div className="text-left sm:pr-6 md:pr-8 sm:border-r border-slate-300">
                    <p className="text-[8px] md:text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Total Global</p>
                    <p className="text-base md:text-lg font-black text-slate-900">
                      <span className="text-xs font-bold text-slate-400 mr-1">R$</span>
                      {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 xl:flex-col xl:justify-center">
                    <button
                      onClick={() => handleOpenModal(contract, undefined, true)}
                      className="flex-1 sm:flex-none h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all text-base"
                      title="Visualizar Contrato"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleOpenModal(contract)}
                      className="flex-1 sm:flex-none h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all text-base"
                      title="Editar Contrato"
                    >
                      ✏️
                    </button>
                    {currentUser.role === 'admin' && onDelete && (
                      <button
                        onClick={() => onDelete(contract.id)}
                        className="flex-1 sm:flex-none h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg md:rounded-xl bg-rose-50 border border-rose-100 text-rose-400 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-all text-base"
                        title="Excluir Contrato"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-300 flex flex-col sm:flex-row flex-wrap gap-x-6 md:gap-x-10 gap-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Cropnograma:</span>
                  <span className={`text-xs md:text-sm font-black ${isUrgent ? 'text-rose-400' : 'text-slate-700'}`}>
                    {new Date(contract.estimatedInstallationDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Termo Final:</span>
                  <span className="text-xs md:text-sm font-black text-slate-700">
                    {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {contract.warranty && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                    <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Garantia Ativa:</span>
                    <span className="text-xs md:text-sm font-black text-emerald-400">Até {new Date(new Date(contract.warranty.completionDate).getTime() + (contract.warranty.warrantyDays * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {contracts.length === 0 && (
          <div className="bg-slate-900/40 p-16 md:p-32 text-center rounded-3xl md:rounded-[3rem] border border-dashed border-slate-800 backdrop-blur-xl">
            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhum contrato ativo no pipeline.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-white/40 shadow-[0_20px_100px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300 overflow-x-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-10">
              <header className="flex justify-between items-center mb-8 md:mb-12">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                    {isViewOnly ? 'Resumo do Contrato' : (editingContract ? 'Gerenciar Contrato' : 'Novo Pipeline')}
                  </h3>
                  <div className="h-1.5 w-16 md:w-20 bg-indigo-600 rounded-full mt-2" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-300 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all text-2xl"
                >
                  &times;
                </button>
              </header>


              {isViewOnly ? (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Informações Gerais</label>
                      <div className="space-y-4">
                        <div>
                          <div className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-1">Objeto do Contrato</div>
                          <div className="text-xl font-black text-slate-900">{formData.title}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-1">Cliente / Órgão</div>
                          <div className="text-lg font-bold text-slate-700">{getClientName(formData.clientId || '')}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Local de Execução</label>
                      <div className="text-slate-800 font-bold leading-relaxed">
                        {formData.installationAddress || 'Endereço não informado'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                      <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-6 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2" /> Plataformas
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Contratadas</div>
                          <div className="text-2xl font-black text-slate-900">{formData.platformContracted}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Instaladas</div>
                          <div className="text-2xl font-black text-slate-900">{formData.platformInstalled}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                      <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] mb-6 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" /> Elevadores
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Contratados</div>
                          <div className="text-2xl font-black text-slate-900">{formData.elevatorContracted}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Instalados</div>
                          <div className="text-2xl font-black text-slate-900">{formData.elevatorInstalled}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100">
                      <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-6">Fluxo Financeiro</h4>
                      <div>
                        <div className="text-[9px] font-black text-indigo-700 uppercase mb-1">Valor Global</div>
                        <div className="text-2xl font-black text-indigo-600">
                          R$ {(formData.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-2">Vigência</div>
                      <div className="text-lg font-black text-slate-900">
                        {formData.startDate ? new Date(formData.startDate).toLocaleDateString('pt-BR') : '-'}
                        <span className="mx-2 text-slate-300">→</span>
                        {formData.endDate ? new Date(formData.endDate).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-2">Deadline Instalação</div>
                      <div className="text-lg font-black text-slate-900">
                        {formData.estimatedInstallationDate ? new Date(formData.estimatedInstallationDate).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-2">Status do Pipeline</div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${formData.status === ContractStatus.ACTIVE ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' :
                        formData.status === ContractStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                          'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                        {formData.status}
                      </span>
                    </div>
                  </div>

                  {formData.observations && (
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Anotações e Histórico</label>
                      <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                        {formData.observations}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-10 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                    >
                      Fechar Visualização
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-10">
                    <div className="lg:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Projeto / Objeto</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        placeholder="Ex: Aquisição de Elevadores - SEDU-ES"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entidade Governamental</label>
                      <select
                        required
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold cursor-pointer"
                      >
                        <option value="">Aponte o cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] flex items-center">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2" /> Plataformas
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Qtd Contratada</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.platformContracted}
                              onChange={e => setFormData({ ...formData, platformContracted: Math.max(0, Number(e.target.value)) })}
                              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Qtd Instalada</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.platformInstalled}
                              onChange={e => setFormData({ ...formData, platformInstalled: Math.max(0, Number(e.target.value)) })}
                              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" /> Elevadores
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Qtd Contratada</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.elevatorContracted}
                              onChange={e => setFormData({ ...formData, elevatorContracted: Math.max(0, Number(e.target.value)) })}
                              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Qtd Instalada</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.elevatorInstalled}
                              onChange={e => setFormData({ ...formData, elevatorInstalled: Math.max(0, Number(e.target.value)) })}
                              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Fluxo Financeiro</h4>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Valor Global do Contrato</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 font-bold">R$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.value}
                              onChange={e => setFormData({ ...formData, value: Math.max(0, Number(e.target.value)) })}
                              className="w-full bg-white border border-indigo-200 text-slate-900 pl-12 pr-4 py-3 rounded-xl font-black text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:col-span-3">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vigência Inicial</label>
                        <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-white border border-slate-300 text-slate-900 p-4 rounded-2xl font-bold" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vencimento Contratual</label>
                        <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-white border border-slate-300 text-slate-900 p-4 rounded-2xl font-bold" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estágio Atual</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                          className="w-full bg-white border border-slate-300 text-slate-900 p-4 rounded-2xl font-black cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value={ContractStatus.PENDING}>Pendente</option>
                          <option value={ContractStatus.ACTIVE}>Ativo</option>
                          <option value={ContractStatus.COMPLETED}>Instalação Concluída</option>
                          <option value={ContractStatus.CLOSED}>Encerrado</option>
                        </select>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Local da Execução / Obra</label>
                      <input type="text" value={formData.installationAddress} onChange={e => setFormData({ ...formData, installationAddress: e.target.value })} className="w-full bg-white border border-slate-300 text-slate-900 p-4 rounded-2xl font-bold" placeholder="Endereço completo da instalação" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deadline de Instalação</label>
                      <input type="date" value={formData.estimatedInstallationDate} onChange={e => setFormData({ ...formData, estimatedInstallationDate: e.target.value })} className="w-full bg-white border border-slate-300 text-slate-900 p-4 rounded-2xl font-black" />
                    </div>

                    <div className="lg:col-span-3 space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Anotações Táticas / Histórico</label>
                      <textarea
                        rows={5}
                        value={formData.observations}
                        onChange={e => setFormData({ ...formData, observations: e.target.value })}
                        placeholder="Documente aqui ocorrências, aditivos e interações com o fiscal do contrato..."
                        className="w-full p-6 bg-white border border-slate-300 rounded-[2rem] text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-bold placeholder:text-slate-400 leading-relaxed"
                      />
                    </div>

                    {formData.status === ContractStatus.COMPLETED && (
                      <div className="lg:col-span-3 p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                        <div>
                          <h4 className="text-xl font-black text-emerald-400 mb-1">Certificado de Garantia</h4>
                          <p className="text-sm text-emerald-500/70 font-medium tracking-tight">Gestão automatizada de prazos pós-instalação.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-8">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Início Garantia</label>
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
                              className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-emerald-100 font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Período (Dias)</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.warranty?.warrantyDays || 365}
                              onChange={e => setFormData({
                                ...formData,
                                warranty: {
                                  completionDate: formData.warranty?.completionDate || '',
                                  warrantyDays: Math.max(0, Number(e.target.value))
                                }
                              })}
                              className="w-full bg-white border border-emerald-500/30 rounded-xl p-3 text-emerald-600 font-bold w-32"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-20 flex justify-end gap-6 pt-10 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-10 py-4 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-black transition-all"
                    >
                      Cancelar Mudanças
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                      Confirmar Contrato
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManager;
