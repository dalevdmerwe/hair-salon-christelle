export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // in ZAR
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

