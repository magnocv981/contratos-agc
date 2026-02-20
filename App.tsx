
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import ContractManager from './components/ContractManager';
import UserManager from './components/UserManager';
import { storage } from './services/storage';
import { Client, Contract, User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for the "Do you want to add a contract?" prompt
  const [promptContractForClient, setPromptContractForClient] = useState<Client | null>(null);
  const [forceContractOpen, setForceContractOpen] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Load initial data
    setClients(storage.getClients());
    setContracts(storage.getContracts());
    setUsers(storage.getUsers());
    
    // Auth simulation
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      // Default admin if none exists
      const defaultAdmin: User = { id: 'admin1', name: 'Administrador Sincro', email: 'admin@sincro.com', role: 'admin' };
      storage.saveUsers([defaultAdmin]);
      setUsers([defaultAdmin]);
      storage.setCurrentUser(defaultAdmin);
      setCurrentUser(defaultAdmin);
    }
  }, []);

  const updateClients = (newClients: Client[]) => {
    setClients(newClients);
    storage.saveClients(newClients);
  };

  const updateContracts = (newContracts: Contract[]) => {
    setContracts(newContracts);
    storage.saveContracts(newContracts);
  };

  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    storage.saveUsers(newUsers);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard clients={clients} contracts={contracts} />;
      case 'clients':
        return (
          <ClientManager
            clients={clients}
            onAdd={(c) => updateClients([...clients, c])}
            onEdit={(c) => updateClients(clients.map(cl => cl.id === c.id ? c : cl))}
            onDelete={(id) => updateClients(clients.filter(cl => cl.id !== id))}
            onPromptContract={(client) => setPromptContractForClient(client)}
          />
        );
      case 'contracts':
        return (
          <ContractManager
            contracts={contracts}
            clients={clients}
            onAdd={(c) => updateContracts([...contracts, c])}
            onEdit={(c) => updateContracts(contracts.map(co => co.id === c.id ? c : co))}
            onDelete={(id) => updateContracts(contracts.filter(co => co.id !== id))}
            forceOpenWithClientId={forceContractOpen}
            onCloseForceOpen={() => setForceContractOpen(undefined)}
          />
        );
      case 'users':
        return (
          <UserManager
            users={users}
            onAdd={(u) => updateUsers([...users, u])}
            onDelete={(id) => updateUsers(users.filter(u => u.id !== id))}
          />
        );
      default:
        return <Dashboard clients={clients} contracts={contracts} />;
    }
  };

  if (!currentUser) return <div className="p-10 text-center">Iniciando sistema...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        userName={currentUser.name}
      />
      
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {/* Contract Prompt Modal */}
      {promptContractForClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cliente cadastrado com sucesso!</h3>
            <p className="text-slate-500 mb-8">
              O cliente <span className="font-bold text-slate-800">"{promptContractForClient.name}"</span> foi adicionado à base. Deseja incluir um contrato para ele agora?
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setForceContractOpen(promptContractForClient.id);
                  setActiveTab('contracts');
                  setPromptContractForClient(null);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Sim, Criar Contrato
              </button>
              <button
                onClick={() => setPromptContractForClient(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                Não, fazer isso depois
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
