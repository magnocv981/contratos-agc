import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import ContractManager from './components/ContractManager';
import UserManager from './components/UserManager';
import ReportManager from './components/ReportManager';
import Login from './components/Login';
import { storage } from './services/storage';
import { Client, Contract, User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [promptContractForClient, setPromptContractForClient] = useState<Client | null>(null);
  const [forceContractOpen, setForceContractOpen] = useState<string | undefined>(undefined);

  const loadData = async () => {
    try {
      const user = await storage.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const [loadedClients, loadedContracts, loadedUsers] = await Promise.all([
          storage.getClients(),
          storage.getContracts(),
          storage.getUsers()
        ]);
        setClients(loadedClients);
        setContracts(loadedContracts);
        setUsers(loadedUsers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateClients = async () => {
    setClients(await storage.getClients());
  };

  const updateContracts = async () => {
    setContracts(await storage.getContracts());
  };

  const updateUsers = async () => {
    setUsers(await storage.getUsers());
  };

  const handleLogout = async () => {
    await storage.signOut();
    setCurrentUser(null);
    setClients([]);
    setContracts([]);
    setUsers([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard clients={clients} contracts={contracts} />;
      case 'clients':
        return (
          <ClientManager
            clients={clients}
            contracts={contracts}
            onAdd={async (c) => {
              const newClient = await storage.saveClient(c);
              await updateClients();
              setPromptContractForClient(newClient);
            }}
            onEdit={async (c) => {
              // Note: Need to implement editClient in storage.ts if needed
              // For now, reload
              await updateClients();
            }}
            onDelete={async (id) => {
              await storage.deleteClient(id);
              await updateClients();
            }}
            onPromptContract={(client) => setPromptContractForClient(client)}
          />
        );
      case 'contracts':
        return (
          <ContractManager
            contracts={contracts}
            clients={clients}
            onAdd={async (c) => {
              await storage.saveContract(c);
              await updateContracts();
            }}
            onEdit={async (c) => {
              // Note: Need to implement editContract in storage.ts
              await updateContracts();
            }}
            onDelete={async (id) => {
              await storage.deleteContract(id);
              await updateContracts();
            }}
            forceOpenWithClientId={forceContractOpen}
            onCloseForceOpen={() => setForceContractOpen(undefined)}
          />
        );
      case 'users':
        return (
          <UserManager
            users={users}
            onAdd={() => updateUsers()}
            onDelete={() => updateUsers()}
          />
        );
      case 'reports':
        return <ReportManager contracts={contracts} clients={clients} />;
      default:
        return <Dashboard clients={clients} contracts={contracts} />;
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div className="p-10 text-center">Iniciando sistema...</div>;
  if (!currentUser) return <Login onLogin={loadData} />;

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-x-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        userName={currentUser.name}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/70 backdrop-blur-md p-4 flex justify-between items-center border-b border-slate-300 sticky top-0 z-30">
          <h1 className="text-xl font-black tracking-tighter text-slate-900">
            SINCRO<span className="text-indigo-500">.</span>
          </h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <span className="text-2xl">☰</span>
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:ml-64 2xl:p-14 max-w-[1600px] mx-auto w-full transition-all duration-500 min-w-0">
          {renderContent()}
        </main>
      </div>

      {promptContractForClient && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 max-w-md w-full border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-emerald-500/30">
              ✨
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Cliente cadastrado!</h3>
            <p className="text-slate-600 leading-relaxed mb-10 text-sm md:text-base">
              O cliente <span className="text-emerald-400 font-bold">"{promptContractForClient.name}"</span> foi adicionado. Gostaria de vincular um contrato agora?
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setForceContractOpen(promptContractForClient.id);
                  setActiveTab('contracts');
                  setPromptContractForClient(null);
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Sim, Criar Contrato
              </button>
              <button
                onClick={() => setPromptContractForClient(null)}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
              >
                Fazer isso depois
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
