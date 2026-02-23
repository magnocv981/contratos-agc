
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 glass-panel text-regular 
        flex flex-col z-50 shadow-2xl lg:shadow-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-strong">
              AGC - ELEV<span className="text-brand-primary">.</span>
            </h1>
            <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-black">Gestão Coletiva de Contratos</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-subtle hover:text-strong transition-colors"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm'
                : 'text-muted hover:bg-slate-100 hover:text-strong'
                }`}
            >
              <span className={`text-xl transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary shadow-indigo" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/40 rounded-3xl p-5 border border-border-default mb-6 group hover:border-brand-primary/30 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black border border-brand-primary/10 shadow-inner group-hover:scale-105 transition-transform">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-strong truncate">{userName}</p>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                  <p className="text-[10px] text-muted uppercase font-black tracking-widest leading-none">Status: Online</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-muted hover:bg-brand-rose/5 hover:text-brand-rose transition-all border border-transparent hover:border-brand-rose/10 group active:scale-95"
          >
            <span className="text-xs font-black uppercase tracking-widest">Encerrar Sessão</span>
            <span className="group-hover:translate-x-1 transition-transform">🚪</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
