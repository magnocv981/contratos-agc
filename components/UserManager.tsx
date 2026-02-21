import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface UserManagerProps {
  users: User[];
  currentUser: User;
  onAdd: () => void;
  onDelete: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, currentUser, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });
      if (error) throw error;

      onAdd();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      alert('Usuário cadastrado com sucesso!');
    } catch (err: any) {
      alert('Erro ao cadastrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário? (Isso não remove o acesso do Auth, apenas o perfil)')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      else onDelete();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-strong">
            Equipe & <span className="text-gradient-indigo">Segurança</span>
          </h2>
          <p className="text-muted font-medium">Controle de acessos e níveis hierárquicos da plataforma</p>
        </div>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2 px-8 py-4 group shadow-premium hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform">＋</span>
            <span className="text-sm font-black uppercase tracking-widest">Novo Integrante</span>
          </button>
        )}
      </header>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border-default bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest">Colaborador</th>
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest">Credencial de Acesso</th>
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest text-center">Nível</th>
                <th className="p-6 text-[10px] font-black text-subtle uppercase tracking-widest text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center font-black text-brand-primary border border-brand-primary/10 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-black text-strong text-base transition-colors">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-medium text-regular text-sm">{user.email}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-inner ${user.role === 'admin'
                        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                        : 'bg-slate-100 text-subtle border-border-default'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-border-default text-subtle hover:text-brand-rose hover:bg-brand-rose/5 transition-all shadow-sm"
                        title="Remover Acesso"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] w-full max-w-lg p-12 border border-white/40 shadow-premium animate-in zoom-in-95 duration-300">
            <header className="mb-10 flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-black text-strong tracking-tight">Novo Acesso</h3>
                <div className="h-1.5 w-16 bg-gradient-brand rounded-full mt-3 shadow-indigo" />
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-subtle hover:text-strong transition-colors text-2xl">✕</button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Nome Nominal</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-white border border-border-default focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-black text-strong" placeholder="Como será visualizado..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-white border border-border-default focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-medium text-strong" placeholder="exemplo@sincro.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Chave de Segurança</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-white border border-border-default focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-strong" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Nível de Acesso</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })} className="w-full px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-black uppercase tracking-widest text-[10px] outline-none cursor-pointer">
                    <option value="user">User</option>
                    <option value="admin">Root Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-10 flex gap-4">
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-5 shadow-premium disabled:opacity-50 transition-all font-black uppercase text-xs tracking-widest">
                  {loading ? 'Sincronizando...' : 'Liberar Credencial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
