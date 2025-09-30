import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { Tenant } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  tenantId: string = '';
  tenant: Tenant | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
      if (this.tenantId) {
        this.loadTenant();
      } else {
        this.loading = false;
      }
    });
  }

  private loadTenant() {
    this.tenantService.getTenantById(this.tenantId).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
        this.loading = false;
      }
    });
  }

  navigateToServices() {
    this.router.navigate(['/admin', this.tenantId, 'services']);
  }

  navigateToBookings() {
    this.router.navigate(['/admin', this.tenantId, 'bookings']);
  }

  navigateToEditDetails() {
    if (this.tenantId) {
      this.router.navigate(['/admin/tenant', this.tenantId, 'edit']);
    }
  }

  navigateToAllTenants() {
    this.router.navigate(['/admin/tenants']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}

