
import { Client, Contract, User } from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'sincro_clients',
  CONTRACTS: 'sincro_contracts',
  USERS: 'sincro_users',
  CURRENT_USER: 'sincro_session'
};

export const storage = {
  getClients: (): Client[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]'),
  saveClients: (clients: Client[]) => localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients)),
  
  getContracts: (): Contract[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]'),
  saveContracts: (contracts: Contract[]) => localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts)),

  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return session ? JSON.parse(session) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};
