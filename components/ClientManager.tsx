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
    address: {
      street: '',
      number: '',
      neighborhood: '',
      cep: '',
      city: '',
      state: ''
    },
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

  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
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
      const newClient: Client = {
        ...formData as Client,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      onAdd(newClient);
      onPromptContract(newClient);
    }
    setIsModalOpen(false);
  };

  const updateAddress = (field: keyof Client['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address!, [field]: value }
    }));
    if (field === 'cep') {
      handleCEPLookup(value);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Base de Clientes</h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium">Gerenciamento centralizado de órgãos e parceiros.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="mr-2 text-xl">+</span>
          Novo Cadastro
        </button>
      </div>

      <div className="bg-white/60 rounded-[2rem] border border-slate-300 shadow-xl overflow-hidden backdrop-blur-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-300">
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Instituição / Órgão</th>
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">CNPJ</th>
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsável</th>
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300/50">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-indigo-50/50 transition-colors group">
                <td className="p-4 md:p-6">
                  <button
                    onClick={() => handleOpenModal(client, true)}
                    className="text-left group/name"
                  >
                    <div className="font-black text-slate-900 group-hover/name:text-indigo-600 transition-colors uppercase tracking-tight">{client.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{client.address.city} • {client.address.state}</div>
                  </button>
                </td>
                <td className="p-4 md:p-6">
                  <span className="font-mono text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 underline decoration-indigo-500/30 whitespace-nowrap">
                    {client.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') || client.cnpj}
                  </span>
                </td>
                <td className="p-4 md:p-6">
                  <div className="text-sm font-semibold text-slate-700">{client.contactPerson}</div>
                  <div className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{client.email}</div>
                </td>
                <td className="p-4 md:p-6 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleOpenModal(client, true)}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50 rounded-xl transition-all border border-slate-300 hover:border-indigo-200 shadow-sm"
                      title="Visualizar Dados"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => ReportService.generateClientFicha(client, contracts)}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50 rounded-xl transition-all border border-slate-300 hover:border-indigo-200 shadow-sm"
                      title="Relatório PDF"
                    >
                      📄
                    </button>
                    <button
                      onClick={() => handleOpenModal(client)}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50 rounded-xl transition-all border border-slate-300 hover:border-indigo-200 shadow-sm"
                      title="Editar Cliente"
                    >
                      ✏️
                    </button>
                    {currentUser.role === 'admin' && onDelete && (
                      <button
                        onClick={() => onDelete(client.id)}
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-white/50 hover:bg-rose-50 rounded-xl transition-all border border-slate-300 hover:border-rose-200 shadow-sm"
                        title="Excluir Cliente"
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
                <td colSpan={4} className="p-10 md:p-20 text-center">
                  <div className="text-slate-600 font-medium italic mb-2">Sem resultados na base.</div>
                  <button onClick={() => handleOpenModal()} className="text-indigo-500 font-bold hover:underline">Adicionar primeiro cliente</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/40 shadow-[0_20px_100px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300 overflow-x-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-10">
              <header className="flex justify-between items-center mb-8 md:mb-12">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                    {isViewOnly ? 'Resumo do Cliente' : (editingClient ? 'Ajustar Dados' : 'Novo Cadastro')}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Instituição / Órgão</label>
                      <div className="text-xl font-black text-slate-900 uppercase">{formData.name}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">CNPJ</label>
                      <div className="text-lg font-mono font-bold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 inline-block whitespace-nowrap">
                        {formData.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') || formData.cnpj}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Endereço de Faturamento</label>
                      <div className="text-slate-800 font-bold leading-relaxed">
                        {formData.address?.street}, {formData.address?.number}<br />
                        {formData.address?.neighborhood}<br />
                        {formData.address?.city} / {formData.address?.state}<br />
                        CEP: {formData.address?.cep}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-8 bg-indigo-50/30 p-8 rounded-3xl border border-indigo-100">
                    <div>
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Contato Principal</label>
                      <div className="font-black text-slate-900">{formData.contactPerson || '-'}</div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">E-mail Corporativo</label>
                      <div className="font-bold text-indigo-600 break-all">{formData.email || '-'}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">WhatsApp / Celular</label>
                      <div className="font-black text-slate-900">{formData.whatsapp || '-'}</div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end pt-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instituição / Órgão</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-bold"
                        placeholder="Nome oficial"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CNPJ</label>
                      <input
                        type="text"
                        required
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-mono font-bold"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-100/30 p-8 rounded-3xl border border-slate-300/50">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CEP</label>
                        <input
                          type="text"
                          value={formData.address?.cep}
                          onChange={(e) => updateAddress('cep', e.target.value)}
                          placeholder="00000-000"
                          className={`w-full px-5 py-3.5 rounded-xl bg-white border ${loadingCEP ? 'border-indigo-500 animate-pulse' : 'border-slate-300'} text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold`}
                        />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Logradouro / Endereço</label>
                        <input
                          type="text"
                          value={formData.address?.street}
                          onChange={(e) => updateAddress('street', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Número</label>
                        <input
                          type="text"
                          value={formData.address?.number}
                          onChange={(e) => updateAddress('number', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bairro</label>
                        <input
                          type="text"
                          value={formData.address?.neighborhood}
                          onChange={(e) => updateAddress('neighborhood', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cidade</label>
                        <input
                          type="text"
                          value={formData.address?.city}
                          onChange={(e) => updateAddress('city', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado (UF)</label>
                        <select
                          value={formData.address?.state}
                          onChange={(e) => updateAddress('state', e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold cursor-pointer"
                        >
                          <option value="">UF</option>
                          {BRAZILIAN_STATES.map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone Fixo</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(00) 0000-0000"
                          className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1 flex items-center italic">WhatsApp <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse" /></label>
                        <input
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="(00) 9.0000-0000"
                          className="w-full px-6 py-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail de Contato</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="comercial@instituicao.gov"
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contatos (Nominal)</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Nomes dos responsáveis principais"
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="mt-16 flex justify-end gap-4 border-t border-slate-200 pt-10">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-4 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-bold transition-all"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      {editingClient ? 'Salvar Modificações' : 'Concluir Cadastro'}
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

export default ClientManager;
