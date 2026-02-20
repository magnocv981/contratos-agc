
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, userName, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: '📊' },
    { id: 'clients', label: 'Clientes', icon: '👥' },
    { id: 'contracts', label: 'Contratos', icon: '📄' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
    { id: 'users', label: 'Usuários', icon: '👤' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white/70 backdrop-blur-xl text-slate-900 
        flex flex-col z-50 border-r border-slate-300 shadow-2xl lg:shadow-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              SINCRO<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-bold">Gestão Governamental</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                ? 'bg-indigo-600/10 text-indigo-600 border border-indigo-500/20'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
              <span className={`text-xl transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/50 rounded-2xl p-4 border border-slate-300 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold border border-indigo-500/10 shadow-inner">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Online</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-500/5 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/10 group"
          >
            <span className="text-sm font-bold uppercase tracking-widest">Sair</span>
            <span className="group-hover:translate-x-1 transition-transform">🚪</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
