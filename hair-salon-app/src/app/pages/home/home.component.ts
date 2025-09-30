import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ServiceService } from '../../core/services/service.service';
import { TenantService } from '../../core/services/tenant.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Service } from '../../core/models/service.model';
import { Tenant } from '../../core/models/tenant.model';
import { BookingFormComponent } from '../../components/booking-form/booking-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BookingFormComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Default tenant slug
  private readonly DEFAULT_TENANT_SLUG = 'christelles-salon';

  tenant: Tenant | null = null;
  services: Service[] = [];
  loading = true;
  heroBackgroundUrl: string | null = null;
  selectedServiceId: string | null = null;
  showBookingForm = false;

  constructor(
    private serviceService: ServiceService,
    private tenantService: TenantService,
    private analyticsService: AnalyticsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadTenant();
  }

  private loadTenant() {
    this.tenantService.getTenantBySlug(this.DEFAULT_TENANT_SLUG).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        if (tenant?.imageUrl) {
          this.heroBackgroundUrl = tenant.imageUrl;
        }
        // Load services for this tenant
        if (tenant) {
          this.loadServices(tenant.id);
          // Track page visit
          this.analyticsService.trackPageVisit(tenant.id, '/').subscribe({
            next: () => console.log('Page visit tracked'),
            error: (error) => console.error('Error tracking visit:', error)
          });
        }
      },
      error: (err) => {
        console.error('Error loading tenant:', err);
        this.loading = false;
      }
    });
  }

  private loadServices(tenantId: string) {
    this.serviceService.getAllServices(tenantId).subscribe({
      next: (services) => {
        this.services = services.filter(s => s.isActive);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.loading = false;
      }
    });
  }

  selectService(serviceId: string) {
    this.selectedServiceId = serviceId;
    this.showBookingForm = true;
    // Scroll to booking form
    setTimeout(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  startBooking() {
    // Expand the booking form without pre-selecting a service
    this.showBookingForm = true;
    // Scroll to booking form
    setTimeout(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getMapEmbedUrl(): SafeResourceUrl {
    if (!this.tenant?.address) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    const encodedAddress = encodeURIComponent(this.tenant.address);
    // Use simple iframe URL (works without API key)
    const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  getDirections() {
    if (!this.tenant?.address) return;

    const encodedAddress = encodeURIComponent(this.tenant.address);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

    window.open(directionsUrl, '_blank');
  }
}

