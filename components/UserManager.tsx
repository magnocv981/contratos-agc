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
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Equipe & Permissões</h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium">Gestão centralizada de operadores e níveis hierárquicos.</p>
        </div>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] active:scale-95 w-full sm:w-auto justify-center"
          >
            <span className="mr-2 text-xl">+</span>
            Novo Integrante
          </button>
        )}
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-slate-300 overflow-hidden shadow-xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100/50">
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Credencial</th>
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Nível</th>
              <th className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Controles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300/50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-100/50 transition-colors group">
                <td className="p-4 md:p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600/10 flex items-center justify-center font-black text-indigo-600 border border-indigo-500/10 group-hover:border-indigo-500/50 transition-colors">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-sm md:text-base">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 md:p-6 text-slate-400 font-medium text-sm">{user.email}</td>
                <td className="p-4 md:p-6 text-center">
                  <span className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${user.role === 'admin'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 md:p-6 text-right">
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/50 border border-slate-300 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-md p-10 border border-white/40 shadow-[0_20px_100px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300">
            <header className="mb-10">
              <h3 className="text-2xl font-black text-slate-900">Novo Acesso</h3>
              <div className="h-1.5 w-12 bg-indigo-600 rounded-full mt-2" />
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Acesso Provisório</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" placeholder="Mín. 6 caracteres" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nível Hierárquico</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-black cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="user">Colaborador (User)</option>
                  <option value="admin">Administrador (Root)</option>
                </select>
              </div>
              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-slate-900 font-bold transition-all">Cancelar</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-95 transition-all text-xs uppercase tracking-widest">
                  {loading ? 'Processando...' : 'Liberar Acesso'}
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
