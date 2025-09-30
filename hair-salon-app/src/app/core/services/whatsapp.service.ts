import { Injectable } from '@angular/core';
import { BookingWithDetails } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  
  /**
   * Send booking confirmation via WhatsApp
   * Opens WhatsApp with pre-filled message
   */
  sendBookingConfirmation(booking: BookingWithDetails, tenantPhone: string): void {
    const message = this.formatBookingConfirmation(booking);
    this.openWhatsApp(booking.customerPhone, message);
  }

  /**
   * Send booking reminder via WhatsApp
   */
  sendBookingReminder(booking: BookingWithDetails, tenantPhone: string): void {
    const message = this.formatBookingReminder(booking);
    this.openWhatsApp(booking.customerPhone, message);
  }

  /**
   * Send booking cancellation via WhatsApp
   */
  sendBookingCancellation(booking: BookingWithDetails, tenantPhone: string): void {
    const message = this.formatBookingCancellation(booking);
    this.openWhatsApp(booking.customerPhone, message);
  }

  /**
   * Send custom message via WhatsApp
   */
  sendCustomMessage(phoneNumber: string, message: string): void {
    this.openWhatsApp(phoneNumber, message);
  }

  /**
   * Open WhatsApp with pre-filled message
   */
  private openWhatsApp(phoneNumber: string, message: string): void {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Open in new window
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Format booking confirmation message
   */
  private formatBookingConfirmation(booking: BookingWithDetails): string {
    const date = this.formatDate(booking.bookingDate);
    
    return `Hi ${booking.customerName}! 👋

Your booking at *${booking.tenantName}* has been confirmed! ✅

📅 *Date:* ${date}
⏰ *Time:* ${booking.bookingTime}
💇 *Service:* ${booking.serviceName}
⏱️ *Duration:* ${booking.serviceDuration} minutes
💰 *Price:* R${booking.servicePrice}

We look forward to seeing you!

If you need to reschedule or cancel, please let us know as soon as possible.

Thank you! 🌟`;
  }

  /**
   * Format booking reminder message
   */
  private formatBookingReminder(booking: BookingWithDetails): string {
    const date = this.formatDate(booking.bookingDate);
    
    return `Hi ${booking.customerName}! 👋

This is a friendly reminder about your upcoming appointment at *${booking.tenantName}*:

📅 *Date:* ${date}
⏰ *Time:* ${booking.bookingTime}
💇 *Service:* ${booking.serviceName}
⏱️ *Duration:* ${booking.serviceDuration} minutes

We look forward to seeing you soon! 🌟

If you need to reschedule, please let us know.`;
  }

  /**
   * Format booking cancellation message
   */
  private formatBookingCancellation(booking: BookingWithDetails): string {
    const date = this.formatDate(booking.bookingDate);
    
    return `Hi ${booking.customerName},

Your booking at *${booking.tenantName}* has been cancelled:

📅 *Date:* ${date}
⏰ *Time:* ${booking.bookingTime}
💇 *Service:* ${booking.serviceName}

If you'd like to reschedule, please let us know and we'll find a new time for you.

Thank you for your understanding.`;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-ZA', options);
  }

  /**
   * Validate South African phone number
   */
  validateSAPhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid SA number
    // Should start with 27 (country code) or 0
    // Should be 10 digits (with 0) or 11 digits (with 27)
    if (cleaned.startsWith('27') && cleaned.length === 11) {
      return true;
    }
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return true;
    }
    
    return false;
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('27')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
      return `+27${cleaned.substring(1)}`;
    }
    
    return phoneNumber;
  }
}

