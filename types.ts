
export enum ContractStatus {
  PENDING = 'Pendente',
  ACTIVE = 'Ativo',
  COMPLETED = 'Instalação Concluída',
  CLOSED = 'Encerrado'
}

export interface Client {
  id: string;
  name: string; // Cliente/Orgão
  cnpj: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    cep: string;
    city: string;
    state: string;
  };
  phone: string;
  whatsapp: string;
  email: string;
  contactPerson: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  platformContracted: number;
  platformInstalled: number;
  elevatorContracted: number;
  elevatorInstalled: number;
  value: number;
  startDate: string;
  endDate: string;
  installationAddress: string;
  estimatedInstallationDate: string;
  status: ContractStatus;
  warranty?: {
    completionDate: string;
    warrantyDays: number;
  };
  observations: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: string;
}

export enum AccountsReceivableStatus {
  PENDING = 'Pendente',
  RECEIVED = 'Recebido',
  CANCELLED = 'Cancelado'
}

export interface AccountsReceivable {
  id: string;
  contractId: string;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  status: AccountsReceivableStatus;
  observations?: string;
  createdAt: string;
  updatedAt: string;
  // Join data
  contractTitle?: string;
  clientName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
