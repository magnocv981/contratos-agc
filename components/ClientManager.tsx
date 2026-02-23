import React, { useState } from 'react';
import { Client, Contract, User } from '../types';
import { ReportService } from '../services/reports';

interface ClientManagerProps {
  clients: Client[];
  contracts: Contract[];
  currentUser: User;
  onAdd: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete?: (id: string) => void;
  onPromptContract: (client: Client) => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ClientManager: React.FC<ClientManagerProps> = ({ clients, contracts, currentUser, onAdd, onEdit, onDelete, onPromptContract }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    cnpj: '',
    address: { street: '', number: '', neighborhood: '', cep: '', city: '', state: '' },
    phone: '',
    whatsapp: '',
    email: '',
    contactPerson: ''
  });

  const handleOpenModal = (client?: Client, viewOnly = false) => {
    setIsViewOnly(viewOnly);
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        cnpj: '',
        address: { street: '', number: '', neighborhood: '', cep: '', city: '', state: '' },
        phone: '',
        whatsapp: '',
        email: '',
        contactPerson: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCEPLookup = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;
    setLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address!,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onEdit({ ...editingClient, ...formData } as Client);
    } else {
      onAdd(formData as Client);
    }
    setIsModalOpen(false);
  };

  const updateAddress = (field: keyof Client['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address!, [field]: value }
    }));
    if (field === 'cep') handleCEPLookup(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-strong">
            Base de <span className="text-gradient-indigo">Clientes</span>
          </h2>
          <p className="text-muted font-medium">Gestão estratégica de órgãos e parceiros governamentais</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2 px-8 py-4 group shadow-premium hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform">＋</span>
          <span className="text-sm font-black uppercase tracking-widest">Novo Cadastro</span>
        </button>
      </header>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-default bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest">Instituição / Órgão</th>
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest">Identificação Fiscal</th>
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest">Responsável</th>
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest text-right">Ações Estratégicas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-brand-primary/[0.02] transition-colors group">
                  <td className="p-6">
                    <button onClick={() => handleOpenModal(client, true)} className="text-left">
                      <div className="font-black text-strong group-hover:text-brand-primary transition-colors uppercase tracking-tight text-base">
                        {client.name}
                      </div>
                      <div className="text-[10px] text-muted font-black uppercase tracking-wider mt-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 mr-2" />
                        {client.address.city} • {client.address.state}
                      </div>
                    </button>
                  </td>
                  <td className="p-6">
                    <span className="font-mono text-xs text-regular bg-white border border-border-default px-3 py-1.5 rounded-xl shadow-sm">
                      {client.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') || client.cnpj}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-black text-strong">{client.contactPerson}</div>
                    <div className="text-xs text-muted font-medium mt-0.5">{client.email}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onPromptContract(client)}
                        className="w-10 h-10 flex items-center justify-center text-subtle hover:text-brand-emerald bg-white hover:bg-brand-emerald/5 rounded-2xl transition-all border border-border-default hover:border-brand-emerald/20 shadow-sm"
                        title="Vincular Contrato"
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => handleOpenModal(client, true)}
                        className="w-10 h-10 flex items-center justify-center text-subtle hover:text-brand-primary bg-white hover:bg-brand-primary/5 rounded-2xl transition-all border border-border-default hover:border-brand-primary/20 shadow-sm"
                        title="Visualizar"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => ReportService.generateClientFicha(client, contracts)}
                        className="w-10 h-10 flex items-center justify-center text-subtle hover:text-brand-primary bg-white hover:bg-brand-primary/5 rounded-2xl transition-all border border-border-default hover:border-brand-primary/20 shadow-sm"
                        title="Relatário PDF"
                      >
                        📄
                      </button>
                      <button
                        onClick={() => handleOpenModal(client)}
                        className="w-10 h-10 flex items-center justify-center text-subtle hover:text-brand-primary bg-white hover:bg-brand-primary/5 rounded-2xl transition-all border border-border-default hover:border-brand-primary/20 shadow-sm"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {currentUser.role === 'admin' && onDelete && (
                        <button
                          onClick={() => onDelete(client.id)}
                          className="w-10 h-10 flex items-center justify-center text-subtle hover:text-brand-rose bg-white hover:bg-brand-rose/5 rounded-2xl transition-all border border-border-default hover:border-brand-rose/20 shadow-sm"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <p className="text-muted font-black uppercase tracking-widest text-xs mb-4">Nenhum cliente registrado</p>
                    <button onClick={() => handleOpenModal()} className="text-brand-primary font-black hover:underline text-sm">
                      Iniciar primeiro cadastro agora
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/40 shadow-premium animate-in zoom-in-95 duration-300">
            <form onSubmit={handleSubmit} className="p-10 md:p-12">
              <header className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-3xl font-black text-strong tracking-tight">
                    {isViewOnly ? 'Ficha do Cliente' : (editingClient ? 'Atualizar Registro' : 'Novo Cadastro')}
                  </h3>
                  <div className="h-1.5 w-24 bg-gradient-brand rounded-full mt-3 shadow-indigo" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-border-default text-subtle hover:text-strong hover:bg-slate-50 transition-all text-2xl shadow-sm"
                >
                  ✕
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Instituição / Órgão</label>
                    <input
                      required
                      readOnly={isViewOnly}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-border-default focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-black text-strong uppercase tracking-tight disabled:bg-slate-50"
                      placeholder="NOME OFICIAL DA ENTIDADE"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">CNPJ / Identificação</label>
                    <input
                      required
                      readOnly={isViewOnly}
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-border-default focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-mono font-bold text-regular disabled:bg-slate-50"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-3xl border border-border-default/50 space-y-6">
                  <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Endereço de Faturamento</h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">CEP</label>
                        <input
                          readOnly={isViewOnly}
                          value={formData.address?.cep}
                          onChange={(e) => updateAddress('cep', e.target.value)}
                          className={`w-full px-5 py-3.5 rounded-xl bg-white border ${loadingCEP ? 'border-brand-primary animate-pulse' : 'border-border-default'} focus:border-brand-primary outline-none transition-all font-bold text-strong`}
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">UF</label>
                        <select
                          disabled={isViewOnly}
                          value={formData.address?.state}
                          onChange={(e) => updateAddress('state', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                        >
                          <option value="">UF</option>
                          {BRAZILIAN_STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Logradouro</label>
                      <input
                        readOnly={isViewOnly}
                        value={formData.address?.street}
                        onChange={(e) => updateAddress('street', e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                        placeholder="Nome da rua/avenida"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Número</label>
                        <input
                          readOnly={isViewOnly}
                          value={formData.address?.number}
                          onChange={(e) => updateAddress('number', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                          placeholder="nº"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Bairro</label>
                        <input
                          readOnly={isViewOnly}
                          value={formData.address?.neighborhood}
                          onChange={(e) => updateAddress('neighborhood', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                          placeholder="Bairro"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Cidade</label>
                      <input
                        readOnly={isViewOnly}
                        value={formData.address?.city}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                        placeholder="Cidade"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-8 p-8 bg-brand-primary/[0.03] rounded-3xl border border-brand-primary/10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Contato Nominal</label>
                    <input
                      readOnly={isViewOnly}
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                      placeholder="Nome do Responsável"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <input
                      readOnly={isViewOnly}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                      placeholder="exemplo@orgao.gov"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Telefone Fixo</label>
                    <input
                      readOnly={isViewOnly}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-border-default focus:border-brand-primary outline-none transition-all font-bold text-strong"
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-emerald uppercase tracking-widest ml-1 flex items-center">
                      WhatsApp <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald ml-2 animate-pulse" />
                    </label>
                    <input
                      readOnly={isViewOnly}
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-xl bg-brand-emerald/[0.02] border border-brand-emerald/20 text-brand-emerald focus:ring-4 focus:ring-brand-emerald/5 outline-none transition-all font-bold"
                      placeholder="(00) 0.0000-0000"
                    />
                  </div>
                </div>
              </div>

              {!isViewOnly && (
                <div className="mt-16 flex justify-end gap-5 border-t border-border-default pt-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 py-5 rounded-2xl text-muted hover:text-strong hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Descartar Alterações
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-12 py-5 shadow-premium hover:scale-105 active:scale-95 transition-all"
                  >
                    {editingClient ? 'Salvar Modificações' : 'Confirmar Registro'}
                  </button>
                </div>
              )}

              {isViewOnly && (
                <div className="mt-16 flex justify-end border-t border-border-default pt-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-primary px-16 py-5 shadow-premium hover:scale-105 active:scale-95 transition-all text-[10px] tracking-widest font-black uppercase"
                  >
                    Fechar Visualização
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
