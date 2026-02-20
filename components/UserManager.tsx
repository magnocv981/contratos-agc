
import React, { useState } from 'react';
import { User } from '../types';

interface UserManagerProps {
  users: User[];
  onAdd: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      ...formData as User,
      id: Math.random().toString(36).substr(2, 9)
    };
    onAdd(newUser);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'user' });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Usuários do Sistema</h2>
          <p className="text-slate-500">Gerencie quem tem acesso à plataforma.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-indigo-900/10"
        >
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">E-mail</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Nível</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{user.name}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => onDelete(user.id)} className="text-rose-500 hover:text-rose-700 font-bold p-2">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Cadastrar Novo Usuário</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">E-mail Corporativo</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Nível de Acesso</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'user'})} className="w-full p-2 border rounded-lg">
                  <option value="user">Usuário Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
