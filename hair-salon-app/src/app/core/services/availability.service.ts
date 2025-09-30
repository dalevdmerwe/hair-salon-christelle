import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface TimeSlot {
  time: string;
  available: boolean;
  conflictingBooking?: {
    customerName: string;
    serviceName: string;
    endTime: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get available time slots for a specific date, service, and tenant
   */
  getAvailableTimeSlots(
    tenantId: string,
    serviceId: string,
    date: Date
  ): Observable<TimeSlot[]> {
    const dateStr = date.toISOString().split('T')[0];

    return from(
      Promise.all([
        // Get the service duration
        this.supabaseService.client
          .from('services')
          .select('duration')
          .eq('id', serviceId)
          .single(),
        // Get existing bookings for that date
        this.supabaseService.client
          .from('bookings')
          .select(`
            *,
            services!inner (
              name,
              duration
            )
          `)
          .eq('tenant_id', tenantId)
          .eq('booking_date', dateStr)
          .in('status', ['pending', 'confirmed'])
      ])
    ).pipe(
      map(([serviceResult, bookingsResult]) => {
        if (serviceResult.error) {
          console.error('Error fetching service:', serviceResult.error);
          throw serviceResult.error;
        }
        if (bookingsResult.error) {
          console.error('Error fetching bookings:', bookingsResult.error);
          throw bookingsResult.error;
        }

        const serviceDuration = serviceResult.data?.duration || 60;
        const existingBookings = bookingsResult.data || [];

        console.log('Checking availability:', {
          date: dateStr,
          serviceDuration,
          existingBookings: existingBookings.length
        });

        // Generate all possible time slots
        const allSlots = this.generateTimeSlots();

        // Check each slot for conflicts
        return allSlots.map(slot => {
          const conflict = this.checkTimeSlotConflict(
            slot.time,
            serviceDuration,
            existingBookings
          );

          return {
            time: slot.time,
            available: !conflict,
            conflictingBooking: conflict || undefined
          };
        });
      }),
      catchError(error => {
        console.error('Error checking availability:', error);
        return of(this.generateTimeSlots().map(slot => ({
          time: slot.time,
          available: true
        })));
      })
    );
  }

  /**
   * Check if a specific time slot conflicts with existing bookings
   */
  private checkTimeSlotConflict(
    requestedTime: string,
    requestedDuration: number,
    existingBookings: any[]
  ): { customerName: string; serviceName: string; endTime: string } | null {
    const requestedStart = this.timeToMinutes(requestedTime);
    const requestedEnd = requestedStart + requestedDuration;

    for (const booking of existingBookings) {
      const bookingStart = this.timeToMinutes(booking.booking_time);
      const bookingDuration = booking.services?.duration || 60;
      const bookingEnd = bookingStart + bookingDuration;

      // Check if time slots overlap
      if (
        (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
        (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
        (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
      ) {
        return {
          customerName: booking.customer_name,
          serviceName: booking.services?.name || 'Unknown Service',
          endTime: this.minutesToTime(bookingEnd)
        };
      }
    }

    return null;
  }

  /**
   * Generate all possible time slots (8:00 AM - 6:00 PM, 30-min intervals)
   */
  private generateTimeSlots(): { time: string }[] {
    const slots: { time: string }[] = [];
    const startHour = 8; // 8:00 AM
    const endHour = 18; // 6:00 PM

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({ time: `${hour.toString().padStart(2, '0')}:00` });
      slots.push({ time: `${hour.toString().padStart(2, '0')}:30` });
    }

    return slots;
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string (HH:MM)
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Check if a specific booking would conflict with existing bookings
   */
  checkBookingAvailability(
    tenantId: string,
    serviceId: string,
    date: Date,
    time: string
  ): Observable<{ available: boolean; reason?: string }> {
    const dateStr = date.toISOString().split('T')[0];

    return from(
      Promise.all([
        // Get the service duration
        this.supabaseService.client
          .from('services')
          .select('duration, name')
          .eq('id', serviceId)
          .single(),
        // Get existing bookings for that date
        this.supabaseService.client
          .from('bookings')
          .select(`
            *,
            services!inner (
              name,
              duration
            )
          `)
          .eq('tenant_id', tenantId)
          .eq('booking_date', dateStr)
          .in('status', ['pending', 'confirmed'])
      ])
    ).pipe(
      map(([serviceResult, bookingsResult]) => {
        if (serviceResult.error) throw serviceResult.error;
        if (bookingsResult.error) throw bookingsResult.error;

        const serviceDuration = serviceResult.data?.duration || 60;
        const serviceName = serviceResult.data?.name || 'Service';
        const existingBookings = bookingsResult.data || [];

        const conflict = this.checkTimeSlotConflict(
          time,
          serviceDuration,
          existingBookings
        );

        if (conflict) {
          return {
            available: false,
            reason: `This time slot conflicts with ${conflict.customerName}'s ${conflict.serviceName} appointment (ends at ${conflict.endTime})`
          };
        }

        return { available: true };
      }),
      catchError(error => {
        console.error('Error checking availability:', error);
        return of({ available: true }); // Fail open
      })
    );
  }
}

