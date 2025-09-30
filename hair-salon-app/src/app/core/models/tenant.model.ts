export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier (e.g., 'christelle-salon')
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  imageUrl: string | null; // Logo or profile image
  businessHours: BusinessHours | null; // Operating hours
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

