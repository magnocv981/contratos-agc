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

  const preventNegative = (e: React.KeyboardEvent) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    if (dataToSave.status === ContractStatus.COMPLETED && !dataToSave.warranty) {
      dataToSave.warranty = {
        completionDate: new Date().toISOString().split('T')[0],
        warrantyDays: 365
      };
    }

    if (!formData.clientId) {
      alert('Por favor, selecione um cliente para o contrato.');
      return;
    }

    if (editingContract) {
      onEdit({ ...editingContract, ...dataToSave } as Contract);
    } else {
      onAdd(dataToSave as Contract);
    }
    setIsModalOpen(false);
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Externo';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-strong">
            Fluxo de <span className="text-gradient-indigo">Contratos</span>
          </h2>
          <p className="text-muted font-medium">Monitoramento tático de termos, prazos e execuções</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2 px-8 py-4 group shadow-premium hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform">＋</span>
          <span className="text-sm font-black uppercase tracking-widest">Gerar Contrato</span>
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {contracts.map((contract) => {
          const deadline = new Date(contract.estimatedInstallationDate);
          const diffDays = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = diffDays <= 15 && diffDays >= 0 && contract.status !== ContractStatus.COMPLETED && contract.status !== ContractStatus.CLOSED;

          return (
            <div
              key={contract.id}
              className={`premium-card relative overflow-hidden transition-all group ${isUrgent ? 'border-brand-rose/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : ''}`}
            >
              {isUrgent && (
                <div className="absolute top-0 right-0 px-5 py-1.5 bg-brand-rose text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg animate-pulse z-10">
                  Prioridade Crítica
                </div>
              )}

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-inner ${contract.status === ContractStatus.ACTIVE ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                      contract.status === ContractStatus.COMPLETED ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' :
                        'bg-slate-50 text-subtle border-border-default'
                      }`}>
                      {contract.status}
                    </span>
                    <span className="text-[10px] text-subtle font-black uppercase tracking-widest opacity-40">{contract.id.slice(0, 8)}</span>
                  </div>

                  <button onClick={() => handleOpenModal(contract, undefined, true)} className="text-left block group/title">
                    <h3 className="text-xl font-black text-strong group-hover:text-brand-primary transition-colors uppercase tracking-tight leading-tight">
                      {contract.title}
                    </h3>
                    <div className="flex items-center mt-2 text-muted">
                      <div className="w-2 h-2 rounded-full bg-brand-primary mr-3 shadow-indigo" />
                      <span className="font-black uppercase tracking-widest text-[10px]">{getClientName(contract.clientId)}</span>
                    </div>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 bg-slate-50/50 p-6 rounded-3xl border border-border-default/50">
                  <div className="md:pr-8 md:border-r border-border-default">
                    <p className="text-[9px] uppercase font-black text-subtle tracking-widest mb-3">Cronograma</p>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted">Instalação: <span className={`font-black ${isUrgent ? 'text-brand-rose' : 'text-strong'}`}>{new Date(contract.estimatedInstallationDate).toLocaleDateString('pt-BR')}</span></p>
                      <p className="text-xs font-bold text-muted">Termo Final: <span className="text-strong font-black">{new Date(contract.endDate).toLocaleDateString('pt-BR')}</span></p>
                    </div>
                  </div>

                  <div className="md:pr-8 md:border-r border-border-default">
                    <p className="text-[9px] uppercase font-black text-subtle tracking-widest mb-3">Valor Global</p>
                    <p className="text-2xl font-black text-strong leading-none">
                      <span className="text-xs font-black text-muted mr-1">R$</span>
                      {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenModal(contract, undefined, true)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-border-default text-subtle hover:text-brand-primary hover:border-brand-primary/20 shadow-sm transition-all"
                      title="Visualizar"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleOpenModal(contract)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-border-default text-subtle hover:text-brand-primary hover:border-brand-primary/20 shadow-sm transition-all"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {currentUser.role === 'admin' && onDelete && (
                      <button
                        onClick={() => onDelete(contract.id)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-border-default text-subtle hover:text-brand-rose hover:border-brand-rose/20 shadow-sm transition-all"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border-default/50 flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-2" />
                    <span className="text-[10px] font-black text-subtle uppercase tracking-widest">PLAT: {contract.platformInstalled}/{contract.platformContracted}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald mr-2" />
                    <span className="text-[10px] font-black text-subtle uppercase tracking-widest">ELEV: {contract.elevatorInstalled}/{contract.elevatorContracted}</span>
                  </div>
                </div>
                {contract.warranty && (
                  <div className="ml-auto flex items-center space-x-3 px-4 py-2 bg-brand-emerald/[0.03] border border-brand-emerald/10 rounded-2xl shadow-inner-soft">
                    <span className="text-[9px] font-black text-brand-emerald uppercase tracking-widest">Manutenção & Garantia:</span>
                    <span className="text-xs font-black text-brand-emerald/80 italic">Até {new Date(new Date(contract.warranty.completionDate).getTime() + (contract.warranty.warrantyDays * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {contracts.length === 0 && (
          <div className="premium-card p-32 text-center border-dashed opacity-50">
            <p className="text-muted font-black uppercase tracking-widest text-xs">Aguardando novos pipelines de contrato</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-white/40 shadow-premium animate-in zoom-in-95 duration-300">
            <form onSubmit={handleSubmit} className="p-10 md:p-12">
              <header className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-3xl font-black text-strong tracking-tight">
                    {isViewOnly ? 'Detalhamento do Contrato' : (editingContract ? 'Gerenciar Termos' : 'Abertura de Workflow')}
                  </h3>
                  <div className="h-1.5 w-24 bg-gradient-brand rounded-full mt-3 shadow-indigo" />
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-border-default text-subtle hover:text-strong hover:bg-slate-50 transition-all text-2xl shadow-sm">✕</button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Objeto do Contrato</label>
                      <input
                        required
                        readOnly={isViewOnly}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-black text-strong uppercase leading-tight disabled:bg-slate-50"
                        placeholder="EX: FORNECIMENTO DE EQUIPAMENTOS DE ACESSIBILIDADE"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Endereço de Instalação</label>
                      <input
                        readOnly={isViewOnly}
                        value={formData.installationAddress}
                        onChange={(e) => setFormData({ ...formData, installationAddress: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong disabled:bg-slate-50"
                        placeholder="Caso seja diferente do endereço do órgão"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-border-default/50 space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-primary tracking-widest">Escopo: Plataformas</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-subtle uppercase">Contractadas</label>
                          <input
                            type="number"
                            min="0"
                            readOnly={isViewOnly}
                            onKeyDown={preventNegative}
                            value={formData.platformContracted}
                            onChange={e => {
                              const val = Math.max(0, Number(e.target.value));
                              setFormData({ ...formData, platformContracted: isNaN(val) ? 0 : val });
                            }}
                            className="w-full bg-white border border-border-default p-3.5 rounded-xl font-black transition-all focus:border-brand-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-subtle uppercase">Instaladas</label>
                          <input
                            type="number"
                            min="0"
                            readOnly={isViewOnly}
                            onKeyDown={preventNegative}
                            value={formData.platformInstalled}
                            onChange={e => {
                              const val = Math.max(0, Number(e.target.value));
                              setFormData({ ...formData, platformInstalled: isNaN(val) ? 0 : val });
                            }}
                            className="w-full bg-white border border-border-default p-3.5 rounded-xl font-black transition-all focus:border-brand-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-border-default/50 space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-emerald tracking-widest">Escopo: Elevadores</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-subtle uppercase">Contractadas</label>
                          <input
                            type="number"
                            min="0"
                            readOnly={isViewOnly}
                            onKeyDown={preventNegative}
                            value={formData.elevatorContracted}
                            onChange={e => {
                              const val = Math.max(0, Number(e.target.value));
                              setFormData({ ...formData, elevatorContracted: isNaN(val) ? 0 : val });
                            }}
                            className="w-full bg-white border border-border-default p-3.5 rounded-xl font-black transition-all focus:border-brand-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-subtle uppercase">Instaladas</label>
                          <input
                            type="number"
                            min="0"
                            readOnly={isViewOnly}
                            onKeyDown={preventNegative}
                            value={formData.elevatorInstalled}
                            onChange={e => {
                              const val = Math.max(0, Number(e.target.value));
                              setFormData({ ...formData, elevatorInstalled: isNaN(val) ? 0 : val });
                            }}
                            className="w-full bg-white border border-border-default p-3.5 rounded-xl font-black transition-all focus:border-brand-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Observações Técnicas / Histórico</label>
                    <textarea readOnly={isViewOnly} value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} className="w-full p-6 bg-white border border-border-default rounded-[2.5rem] text-strong focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-medium leading-relaxed resize-none disabled:bg-slate-50" rows={6} placeholder="..." />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-brand-primary/[0.03] rounded-3xl border border-brand-primary/10 space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Cliente / Órgão</label>
                      <select disabled={isViewOnly} value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none font-bold text-strong transition-all">
                        <option value="">SELECIONAR CLIENTE</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Valor Global (BRL)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        readOnly={isViewOnly}
                        onKeyDown={preventNegative}
                        value={formData.value}
                        onChange={e => {
                          const val = Math.max(0, Number(e.target.value));
                          setFormData({ ...formData, value: isNaN(val) ? 0 : val });
                        }}
                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none font-black text-xl text-brand-primary"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Status Operacional</label>
                      <select disabled={isViewOnly} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })} className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-black uppercase tracking-widest text-[10px] outline-none transition-all">
                        {Object.values(ContractStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {String(formData.status).toLowerCase() === ContractStatus.COMPLETED.toLowerCase() && (
                    <div className="p-8 border-2 border-brand-emerald bg-brand-emerald/[0.02] rounded-3xl space-y-6 shadow-premium transition-all">
                      <header className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-brand-emerald rounded-lg text-white font-bold text-xs ring-4 ring-brand-emerald/10">🛡️</div>
                          <h4 className="text-[10px] font-black uppercase text-brand-emerald tracking-widest">Controle de Garantia</h4>
                        </div>
                      </header>

                      <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-brand-emerald/70 uppercase tracking-wider ml-1">Data de Conclusão da Instalação</label>
                          <input
                            type="date"
                            readOnly={isViewOnly}
                            value={formData.warranty?.completionDate || ''}
                            onChange={e => setFormData({
                              ...formData,
                              warranty: {
                                completionDate: e.target.value,
                                warrantyDays: formData.warranty?.warrantyDays || 365
                              }
                            })}
                            className="w-full bg-white border-2 border-brand-emerald/20 px-5 py-3.5 rounded-2xl font-black text-slate-800 focus:border-brand-emerald outline-none transition-all text-sm shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-brand-emerald/70 uppercase tracking-wider ml-1">Dias de Garantia (Cobertura)</label>
                          <input
                            type="number"
                            min="0"
                            readOnly={isViewOnly}
                            onKeyDown={preventNegative}
                            value={formData.warranty?.warrantyDays || 365}
                            onChange={e => setFormData({
                              ...formData,
                              warranty: {
                                completionDate: formData.warranty?.completionDate || new Date().toISOString().split('T')[0],
                                warrantyDays: Math.max(0, Number(e.target.value))
                              }
                            })}
                            className="w-full bg-white border-2 border-brand-emerald/20 px-5 py-3.5 rounded-2xl font-black text-slate-800 focus:border-brand-emerald outline-none transition-all text-sm shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-8 bg-slate-50 rounded-3xl border border-border-default/50 space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-subtle tracking-widest">Cronograma Dimensional</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-subtle uppercase">Início Vigência</label>
                        <input type="date" readOnly={isViewOnly} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-default font-bold text-strong" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-subtle uppercase">Término Contratual</label>
                        <input type="date" readOnly={isViewOnly} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-default font-bold text-strong" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-brand-primary uppercase">Deadline Instalação</label>
                        <input type="date" readOnly={isViewOnly} value={formData.estimatedInstallationDate} onChange={e => setFormData({ ...formData, estimatedInstallationDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-brand-primary/20 bg-brand-primary/[0.02] font-black text-brand-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!isViewOnly ? (
                <div className="mt-16 flex justify-end gap-5 border-t border-border-default pt-10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 rounded-2xl text-muted hover:text-strong hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest transition-all">Descartar</button>
                  <button type="submit" className="btn-primary px-16 py-5 shadow-premium hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest">Confirmar Workflow</button>
                </div>
              ) : (
                <div className="mt-16 flex justify-end border-t border-border-default pt-10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-primary px-20 py-5 shadow-premium hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest">Fechar Registro</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManager;
