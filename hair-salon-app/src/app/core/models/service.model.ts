export interface Service {
  id: string;
  tenantId: string | null; // null = global/template service
  name: string;
  description: string | null;
  duration: number; // in minutes
  price: number; // in ZAR
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

