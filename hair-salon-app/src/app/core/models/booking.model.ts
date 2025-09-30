export interface Booking {
  id: string;
  tenantId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  bookingDate: Date;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingWithDetails extends Booking {
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  tenantName: string;
}

