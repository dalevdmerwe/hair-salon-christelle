import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Booking, BookingWithDetails } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private supabaseService: SupabaseService) {}

  // Get all bookings for a tenant
  getAllBookings(tenantId: string): Observable<BookingWithDetails[]> {
    return from(
      this.supabaseService.client
        .from('bookings')
        .select(`
          *,
          services!inner (
            name,
            price,
            duration
          ),
          tenants!inner (
            name
          )
        `)
        .eq('tenant_id', tenantId)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching bookings:', error);
          throw error;
        }
        console.log('Bookings data:', data); // Debug log
        return (data || []).map((item: any) => this.mapToBookingWithDetails(item));
      }),
      catchError(error => {
        console.error('Error fetching bookings:', error);
        return of([]);
      })
    );
  }

  // Get bookings by date range
  getBookingsByDateRange(tenantId: string, startDate: Date, endDate: Date): Observable<BookingWithDetails[]> {
    return from(
      this.supabaseService.client
        .from('bookings')
        .select(`
          *,
          services (
            name,
            price,
            duration
          ),
          tenants (
            name
          )
        `)
        .eq('tenant_id', tenantId)
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .lte('booking_date', endDate.toISOString().split('T')[0])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(this.mapToBookingWithDetails);
      }),
      catchError(error => {
        console.error('Error fetching bookings:', error);
        return of([]);
      })
    );
  }

  // Get booking by ID
  getBookingById(id: string): Observable<BookingWithDetails | null> {
    return from(
      this.supabaseService.client
        .from('bookings')
        .select(`
          *,
          services (
            name,
            price,
            duration
          ),
          tenants (
            name
          )
        `)
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ? this.mapToBookingWithDetails(data) : null;
      }),
      catchError(error => {
        console.error('Error fetching booking:', error);
        return of(null);
      })
    );
  }

  // Create a new booking
  createBooking(booking: Partial<Booking>): Observable<Booking | null> {
    const dbData = {
      tenant_id: booking.tenantId,
      service_id: booking.serviceId,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
      customer_phone: booking.customerPhone,
      booking_date: booking.bookingDate,
      booking_time: booking.bookingTime,
      status: booking.status || 'pending',
      notes: booking.notes
    };

    return from(
      this.supabaseService.client
        .from('bookings')
        .insert(dbData)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ? this.mapToBooking(data) : null;
      }),
      catchError(error => {
        console.error('Error creating booking:', error);
        return of(null);
      })
    );
  }

  // Update booking
  updateBooking(id: string, updates: Partial<Booking>): Observable<Booking | null> {
    const dbData: any = {};
    
    if (updates.serviceId !== undefined) dbData.service_id = updates.serviceId;
    if (updates.customerName !== undefined) dbData.customer_name = updates.customerName;
    if (updates.customerEmail !== undefined) dbData.customer_email = updates.customerEmail;
    if (updates.customerPhone !== undefined) dbData.customer_phone = updates.customerPhone;
    if (updates.bookingDate !== undefined) dbData.booking_date = updates.bookingDate;
    if (updates.bookingTime !== undefined) dbData.booking_time = updates.bookingTime;
    if (updates.status !== undefined) dbData.status = updates.status;
    if (updates.notes !== undefined) dbData.notes = updates.notes;

    return from(
      this.supabaseService.client
        .from('bookings')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ? this.mapToBooking(data) : null;
      }),
      catchError(error => {
        console.error('Error updating booking:', error);
        return of(null);
      })
    );
  }

  // Delete booking
  deleteBooking(id: string): Observable<boolean> {
    return from(
      this.supabaseService.client
        .from('bookings')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      }),
      catchError(error => {
        console.error('Error deleting booking:', error);
        return of(false);
      })
    );
  }

  // Cancel booking
  cancelBooking(id: string): Observable<Booking | null> {
    return this.updateBooking(id, { status: 'cancelled' });
  }

  // Confirm booking
  confirmBooking(id: string): Observable<Booking | null> {
    return this.updateBooking(id, { status: 'confirmed' });
  }

  // Complete booking
  completeBooking(id: string): Observable<Booking | null> {
    return this.updateBooking(id, { status: 'completed' });
  }

  // Map database row to Booking model
  private mapToBooking(data: any): Booking {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      serviceId: data.service_id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      bookingDate: new Date(data.booking_date),
      bookingTime: data.booking_time,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }

  // Map database row with joins to BookingWithDetails
  private mapToBookingWithDetails(data: any): BookingWithDetails {
    const booking = this.mapToBooking(data);
    return {
      ...booking,
      serviceName: data.services?.name || 'Unknown Service',
      servicePrice: data.services?.price || 0,
      serviceDuration: data.services?.duration || 0,
      tenantName: data.tenants?.name || 'Unknown Tenant'
    };
  }
}

