import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { TenantService } from '../../../core/services/tenant.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { BookingWithDetails } from '../../../core/models/booking.model';
import { Tenant } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  tenantId: string = '';
  tenant: Tenant | null = null;
  bookings: BookingWithDetails[] = [];
  filteredBookings: BookingWithDetails[] = [];
  loading = true;
  
  // Filters
  selectedStatus: string = 'all';
  selectedDate: string = '';
  searchQuery: string = '';

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private tenantService: TenantService,
    private whatsappService: WhatsAppService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
      this.loadTenant();
      this.loadBookings();
    });
  }

  loadTenant() {
    this.tenantService.getTenantById(this.tenantId).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
      }
    });
  }

  loadBookings() {
    this.loading = true;
    console.log('Loading bookings for tenant:', this.tenantId);
    this.bookingService.getAllBookings(this.tenantId).subscribe({
      next: (bookings) => {
        console.log('Loaded bookings:', bookings);
        this.bookings = bookings;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredBookings = this.bookings.filter(booking => {
      // Status filter
      if (this.selectedStatus !== 'all' && booking.status !== this.selectedStatus) {
        return false;
      }

      // Date filter
      if (this.selectedDate) {
        const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
        if (bookingDate !== this.selectedDate) {
          return false;
        }
      }

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          booking.customerName.toLowerCase().includes(query) ||
          booking.customerPhone.toLowerCase().includes(query) ||
          (booking.customerEmail && booking.customerEmail.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }

  onStatusFilterChange(event: any) {
    this.selectedStatus = event.target.value;
    this.applyFilters();
  }

  onDateFilterChange(event: any) {
    this.selectedDate = event.target.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  confirmBooking(booking: BookingWithDetails) {
    if (confirm(`Confirm booking for ${booking.customerName}?`)) {
      this.bookingService.confirmBooking(booking.id).subscribe({
        next: () => {
          this.loadBookings();
          // Send WhatsApp confirmation
          if (this.tenant?.phone) {
            this.whatsappService.sendBookingConfirmation(booking, this.tenant.phone);
          }
        },
        error: (error) => {
          console.error('Error confirming booking:', error);
          alert('Failed to confirm booking');
        }
      });
    }
  }

  cancelBooking(booking: BookingWithDetails) {
    if (confirm(`Cancel booking for ${booking.customerName}?`)) {
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: () => {
          this.loadBookings();
          // Send WhatsApp cancellation
          if (this.tenant?.phone) {
            this.whatsappService.sendBookingCancellation(booking, this.tenant.phone);
          }
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking');
        }
      });
    }
  }

  completeBooking(booking: BookingWithDetails) {
    if (confirm(`Mark booking for ${booking.customerName} as completed?`)) {
      this.bookingService.completeBooking(booking.id).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (error) => {
          console.error('Error completing booking:', error);
          alert('Failed to complete booking');
        }
      });
    }
  }

  deleteBooking(booking: BookingWithDetails) {
    if (confirm(`Delete booking for ${booking.customerName}? This cannot be undone.`)) {
      this.bookingService.deleteBooking(booking.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadBookings();
          } else {
            alert('Failed to delete booking');
          }
        },
        error: (error) => {
          console.error('Error deleting booking:', error);
          alert('Failed to delete booking');
        }
      });
    }
  }

  sendReminder(booking: BookingWithDetails) {
    if (this.tenant?.phone) {
      this.whatsappService.sendBookingReminder(booking, this.tenant.phone);
    } else {
      alert('Please add a phone number to the tenant settings');
    }
  }

  callCustomer(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  whatsappCustomer(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get upcomingBookings(): BookingWithDetails[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.filteredBookings.filter(b => 
      new Date(b.bookingDate) >= today && 
      (b.status === 'pending' || b.status === 'confirmed')
    );
  }

  get pastBookings(): BookingWithDetails[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.filteredBookings.filter(b => 
      new Date(b.bookingDate) < today || 
      b.status === 'completed' || 
      b.status === 'cancelled'
    );
  }

  get todayBookings(): BookingWithDetails[] {
    const today = new Date().toISOString().split('T')[0];
    return this.filteredBookings.filter(b => {
      const bookingDate = new Date(b.bookingDate).toISOString().split('T')[0];
      return bookingDate === today && (b.status === 'pending' || b.status === 'confirmed');
    });
  }

  get stats() {
    return {
      total: this.bookings.length,
      pending: this.bookings.filter(b => b.status === 'pending').length,
      confirmed: this.bookings.filter(b => b.status === 'confirmed').length,
      today: this.todayBookings.length
    };
  }
}

