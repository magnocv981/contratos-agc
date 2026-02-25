
import { supabase } from './supabase';
import { Client, Contract, User, AccountsReceivable, AccountsReceivableStatus } from '../types';

// Helper mappers for consistent data structures
const sanitizeDate = (date: string | undefined): string | null => {
  if (!date || date.trim() === '') return null;
  return date;
};

const mapClient = (c: any): Client => ({
  ...c,
  address: {
    street: c.street,
    number: c.number,
    neighborhood: c.neighborhood,
    cep: c.cep,
    city: c.city,
    state: c.state
  },
  phone: c.phone,
  whatsapp: c.whatsapp,
  email: c.email,
  contactPerson: c.contact_person,
  createdAt: c.created_at
});

const mapContract = (c: any): Contract => ({
  ...c,
  clientId: c.client_id,
  platformContracted: c.platform_contracted,
  platformInstalled: c.platform_installed,
  elevatorContracted: c.elevator_contracted,
  elevatorInstalled: c.elevator_installed,
  startDate: c.start_date,
  endDate: c.end_date,
  installationAddress: c.installation_address,
  estimatedInstallationDate: c.estimated_installation_date,
  warranty: c.warranty_completion_date ? {
    completionDate: c.warranty_completion_date,
    warrantyDays: c.warranty_days
  } : undefined,
  updatedBy: c.updated_by,
  updatedByName: c.profiles?.name,
  createdAt: c.created_at
});

const mapAccountsReceivable = (r: any): AccountsReceivable => ({
  id: r.id,
  contractId: r.contract_id,
  invoiceNumber: r.invoice_number,
  issueDate: r.issue_date,
  dueDate: r.due_date,
  status: r.status as AccountsReceivableStatus,
  observations: r.observations,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  contractTitle: r.contracts?.title,
  clientName: r.contracts?.clients?.name
});

export const storage = {
  // Clients
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data || []).map(mapClient);
  },

  saveClient: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        cnpj: client.cnpj,
        street: client.address.street,
        number: client.address.number,
        neighborhood: client.address.neighborhood,
        cep: client.address.cep,
        city: client.address.city,
        state: client.address.state,
        phone: client.phone,
        whatsapp: client.whatsapp,
        email: client.email,
        contact_person: client.contactPerson
      })
      .select()
      .single();
    if (error) throw error;
    return mapClient(data);
  },

  deleteClient: async (id: string): Promise<void> => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },

  updateClient: async (client: Client): Promise<void> => {
    const { error } = await supabase
      .from('clients')
      .update({
        name: client.name,
        cnpj: client.cnpj,
        street: client.address.street,
        number: client.address.number,
        neighborhood: client.address.neighborhood,
        cep: client.address.cep,
        city: client.address.city,
        state: client.address.state,
        phone: client.phone,
        whatsapp: client.whatsapp,
        email: client.email,
        contact_person: client.contactPerson
      })
      .eq('id', client.id);
    if (error) throw error;
  },

  // Contracts
  getContracts: async (): Promise<Contract[]> => {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapContract);
  },

  saveContract: async (contract: Omit<Contract, 'id' | 'createdAt'>): Promise<Contract> => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        client_id: contract.clientId,
        title: contract.title,
        platform_contracted: contract.platformContracted,
        platform_installed: contract.platformInstalled,
        elevator_contracted: contract.elevatorContracted,
        elevator_installed: contract.elevatorInstalled,
        value: contract.value,
        start_date: sanitizeDate(contract.startDate),
        end_date: sanitizeDate(contract.endDate),
        installation_address: contract.installationAddress,
        estimated_installation_date: sanitizeDate(contract.estimatedInstallationDate),
        status: contract.status,
        warranty_completion_date: sanitizeDate(contract.warranty?.completionDate),
        warranty_days: contract.warranty?.warrantyDays,
        observations: contract.observations,
        updated_by: session?.user?.id
      })
      .select('*, profiles(name)')
      .single();
    if (error) throw error;
    return mapContract(data);
  },

  deleteContract: async (id: string): Promise<void> => {
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) throw error;
  },

  updateContract: async (contract: Contract): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from('contracts')
      .update({
        client_id: contract.clientId,
        title: contract.title,
        platform_contracted: contract.platformContracted,
        platform_installed: contract.platformInstalled,
        elevator_contracted: contract.elevatorContracted,
        elevator_installed: contract.elevatorInstalled,
        value: contract.value,
        start_date: sanitizeDate(contract.startDate),
        end_date: sanitizeDate(contract.endDate),
        installation_address: contract.installationAddress,
        estimated_installation_date: sanitizeDate(contract.estimatedInstallationDate),
        status: contract.status,
        warranty_completion_date: sanitizeDate(contract.warranty?.completionDate),
        warranty_days: contract.warranty?.warrantyDays,
        observations: contract.observations,
        updated_by: session?.user?.id
      })
      .eq('id', contract.id);
    if (error) throw error;
  },

  // Accounts Receivable
  getAccountsReceivable: async (): Promise<AccountsReceivable[]> => {
    const { data, error } = await supabase
      .from('accounts_receivable')
      .select('*, contracts(title, clients(name))')
      .order('due_date', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapAccountsReceivable);
  },

  saveAccountsReceivable: async (receivable: Omit<AccountsReceivable, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountsReceivable> => {
    const { data, error } = await supabase
      .from('accounts_receivable')
      .insert({
        contract_id: receivable.contractId,
        invoice_number: receivable.invoiceNumber,
        issue_date: sanitizeDate(receivable.issueDate),
        due_date: sanitizeDate(receivable.dueDate),
        status: receivable.status,
        observations: receivable.observations
      })
      .select('*, contracts(title, clients(name))')
      .single();
    if (error) throw error;
    return mapAccountsReceivable(data);
  },

  updateAccountsReceivable: async (receivable: AccountsReceivable): Promise<void> => {
    const { error } = await supabase
      .from('accounts_receivable')
      .update({
        invoice_number: receivable.invoiceNumber,
        issue_date: sanitizeDate(receivable.issueDate),
        due_date: sanitizeDate(receivable.dueDate),
        status: receivable.status,
        observations: receivable.observations,
        updated_at: new Date().toISOString()
      })
      .eq('id', receivable.id);
    if (error) throw error;
  },

  deleteAccountsReceivable: async (id: string): Promise<void> => {
    const { error } = await supabase.from('accounts_receivable').delete().eq('id', id);
    if (error) throw error;
  },

  generateReceivableForContract: async (contractId: string): Promise<void> => {
    const { error } = await supabase
      .from('accounts_receivable')
      .insert({
        contract_id: contractId,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pendente'
      });
    if (error) throw error;
  },

  // Users / Profiles
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    return profile;
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },
  supabase
};
