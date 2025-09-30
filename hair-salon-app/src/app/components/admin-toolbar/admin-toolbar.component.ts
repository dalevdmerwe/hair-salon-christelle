import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Tenant } from '../../core/models/tenant.model';

@Component({
  selector: 'app-admin-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-toolbar.component.html',
  styleUrls: ['./admin-toolbar.component.scss']
})
export class AdminToolbarComponent {
  @Input() tenant: Tenant | null = null;
  @Input() tenantId: string = '';
  @Input() currentPage: 'dashboard' | 'services' | 'bookings' | 'tenants' = 'dashboard';

  constructor(private router: Router) {}

  navigateToDashboard() {
    if (this.tenantId) {
      this.router.navigate(['/admin', this.tenantId]);
    }
  }

  navigateToServices() {
    if (this.tenantId) {
      this.router.navigate(['/admin', this.tenantId, 'services']);
    }
  }

  navigateToBookings() {
    if (this.tenantId) {
      this.router.navigate(['/admin', this.tenantId, 'bookings']);
    }
  }

  navigateToTenants() {
    this.router.navigate(['/admin/tenants']);
  }
}

