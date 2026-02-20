
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
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
