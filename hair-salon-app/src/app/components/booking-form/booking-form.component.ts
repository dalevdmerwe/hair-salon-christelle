import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../core/models/service.model';
import { Tenant } from '../../core/models/tenant.model';
import { Booking } from '../../core/models/booking.model';
import { BookingService } from '../../core/services/booking.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { AvailabilityService, TimeSlot } from '../../core/services/availability.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent {
  @Input() tenant: Tenant | null = null;
  @Input() services: Service[] = [];
  @Input() set preSelectedServiceId(value: string | null) {
    if (value) {
      this.bookingForm.serviceId = value;
      this.onServiceChange();
    }
  }
  @Output() bookingCreated = new EventEmitter<Booking>();

  bookingForm = {
    serviceId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    bookingTime: '',
    notes: ''
  };

  selectedService: Service | null = null;
  submitting = false;
  showSuccess = false;
  errorMessage = '';
  loadingTimeSlots = false;

  // Available time slots
  timeSlots: TimeSlot[] = [];
  allTimeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  constructor(
    private bookingService: BookingService,
    private whatsappService: WhatsAppService,
    private availabilityService: AvailabilityService
  ) {
    // Initialize with all slots available
    this.timeSlots = this.allTimeSlots.map(time => ({
      time,
      available: true
    }));
  }

  onServiceChange() {
    this.selectedService = this.services.find(s => s.id === this.bookingForm.serviceId) || null;
    this.checkAvailability();
  }

  onDateChange() {
    this.checkAvailability();
  }

  selectTimeSlot(time: string) {
    this.bookingForm.bookingTime = time;
    this.errorMessage = ''; // Clear any previous errors
  }

  checkAvailability() {
    if (!this.tenant || !this.bookingForm.serviceId || !this.bookingForm.bookingDate) {
      // Reset to all available if missing required fields
      this.timeSlots = this.allTimeSlots.map(time => ({
        time,
        available: true
      }));
      return;
    }

    this.loadingTimeSlots = true;
    const date = new Date(this.bookingForm.bookingDate);

    this.availabilityService.getAvailableTimeSlots(
      this.tenant.id,
      this.bookingForm.serviceId,
      date
    ).subscribe({
      next: (slots) => {
        this.timeSlots = slots;
        this.loadingTimeSlots = false;

        // If selected time is no longer available, clear it
        if (this.bookingForm.bookingTime) {
          const selectedSlot = slots.find(s => s.time === this.bookingForm.bookingTime);
          if (selectedSlot && !selectedSlot.available) {
            this.bookingForm.bookingTime = '';
            this.errorMessage = 'Your selected time is no longer available. Please choose another time.';
          }
        }
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        this.loadingTimeSlots = false;
        // Fail open - show all slots as available
        this.timeSlots = this.allTimeSlots.map(time => ({
          time,
          available: true
        }));
      }
    });
  }

  async submitBooking() {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    try {
      const booking: Partial<Booking> = {
        tenantId: this.tenant!.id,
        serviceId: this.bookingForm.serviceId,
        customerName: this.bookingForm.customerName,
        customerEmail: this.bookingForm.customerEmail || null,
        customerPhone: this.bookingForm.customerPhone,
        bookingDate: new Date(this.bookingForm.bookingDate),
        bookingTime: this.bookingForm.bookingTime,
        status: 'pending',
        notes: this.bookingForm.notes || null
      };

      console.log('Creating booking:', booking);

      this.bookingService.createBooking(booking).subscribe({
        next: (createdBooking) => {
          console.log('Booking created:', createdBooking);
          if (createdBooking) {
            this.showSuccess = true;
            this.bookingCreated.emit(createdBooking);
            
            // Send WhatsApp confirmation
            if (this.tenant?.phone) {
              this.sendWhatsAppConfirmation(createdBooking);
            }

            // Reset form after 3 seconds
            setTimeout(() => {
              this.resetForm();
              this.showSuccess = false;
            }, 3000);
          } else {
            this.errorMessage = 'Failed to create booking. Please try again.';
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating booking:', error);
          this.errorMessage = 'An error occurred. Please try again.';
          this.submitting = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage = 'An error occurred. Please try again.';
      this.submitting = false;
    }
  }

  sendWhatsAppConfirmation(booking: Booking) {
    if (!this.tenant || !this.selectedService) return;

    const bookingWithDetails = {
      ...booking,
      serviceName: this.selectedService.name,
      servicePrice: this.selectedService.price,
      serviceDuration: this.selectedService.duration,
      tenantName: this.tenant.name
    };

    // Send to customer
    this.whatsappService.sendBookingConfirmation(bookingWithDetails, this.tenant.phone || '');
  }

  validateForm(): boolean {
    if (!this.tenant) {
      this.errorMessage = 'Tenant information is missing.';
      return false;
    }

    if (!this.bookingForm.serviceId) {
      this.errorMessage = 'Please select a service.';
      return false;
    }

    if (!this.bookingForm.customerName.trim()) {
      this.errorMessage = 'Please enter your name.';
      return false;
    }

    if (!this.bookingForm.customerPhone.trim()) {
      this.errorMessage = 'Please enter your phone number.';
      return false;
    }

    if (!this.whatsappService.validateSAPhoneNumber(this.bookingForm.customerPhone)) {
      this.errorMessage = 'Please enter a valid South African phone number.';
      return false;
    }

    if (!this.bookingForm.bookingDate) {
      this.errorMessage = 'Please select a date.';
      return false;
    }

    if (!this.bookingForm.bookingTime) {
      this.errorMessage = 'Please select a time.';
      return false;
    }

    // Check if date is in the past
    const selectedDate = new Date(this.bookingForm.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      this.errorMessage = 'Please select a future date.';
      return false;
    }

    return true;
  }

  resetForm() {
    this.bookingForm = {
      serviceId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      bookingDate: '',
      bookingTime: '',
      notes: ''
    };
    this.selectedService = null;
    this.errorMessage = '';
  }

  // Get minimum date (today)
  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get maximum date (3 months from now)
  get maxDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  }
}

