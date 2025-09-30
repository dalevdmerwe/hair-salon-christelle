export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier (e.g., 'christelle-salon')
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  imageUrl: string | null; // Logo or profile image
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

