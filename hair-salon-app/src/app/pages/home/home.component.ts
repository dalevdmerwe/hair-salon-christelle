import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../core/services/service.service';
import { TenantService } from '../../core/services/tenant.service';
import { Service } from '../../core/models/service.model';
import { Tenant } from '../../core/models/tenant.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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

  constructor(
    private serviceService: ServiceService,
    private tenantService: TenantService
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
}

