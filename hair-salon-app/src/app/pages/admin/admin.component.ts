import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from '../../core/services/service.service';
import { TenantService } from '../../core/services/tenant.service';
import { Service } from '../../core/models/service.model';
import { Tenant } from '../../core/models/tenant.model';
import { AdminToolbarComponent } from '../../components/admin-toolbar/admin-toolbar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminToolbarComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  tenantId: string = '';
  tenant: Tenant | null = null;
  services: Service[] = [];
  loading = true;
  error: string | null = null;
  
  // Form state
  showForm = false;
  editingService: Service | null = null;
  
  // Form model
  serviceForm = {
    id: '',
    name: '',
    description: '',
    duration: 30,
    price: 0,
    isActive: true
  };

  constructor(
    private serviceService: ServiceService,
    private tenantService: TenantService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get tenantId from route params
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
      if (this.tenantId) {
        this.loadTenant();
        this.loadServices();
      } else {
        this.error = 'No tenant ID provided';
        this.loading = false;
      }
    });
  }

  loadTenant() {
    this.tenantService.getTenantById(this.tenantId).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        if (!tenant) {
          this.error = 'Tenant not found';
        }
      },
      error: (err) => {
        console.error('Error loading tenant:', err);
        this.error = 'Failed to load tenant information.';
      }
    });
  }

  loadServices() {
    this.loading = true;
    this.error = null;

    this.serviceService.getAllServices(this.tenantId).subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error = 'Failed to load services. Please try again.';
        this.loading = false;
      }
    });
  }

  backToTenants() {
    this.router.navigate(['/admin/tenants']);
  }

  openCreateForm() {
    this.editingService = null;
    this.serviceForm = {
      id: '',
      name: '',
      description: '',
      duration: 30,
      price: 0,
      isActive: true
    };
    this.showForm = true;
  }

  openEditForm(service: Service) {
    this.editingService = service;
    this.serviceForm = {
      id: service.id,
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      isActive: service.isActive
    };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingService = null;
  }

  saveService() {
    if (!this.serviceForm.name || this.serviceForm.duration <= 0 || this.serviceForm.price < 0) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    const serviceData: Partial<Service> = {
      name: this.serviceForm.name,
      description: this.serviceForm.description || null,
      duration: this.serviceForm.duration,
      price: this.serviceForm.price,
      isActive: this.serviceForm.isActive
    };

    if (this.editingService) {
      // Update existing service
      this.serviceService.updateService(this.editingService.id, serviceData).subscribe({
        next: () => {
          this.loadServices();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating service:', err);
          alert('Failed to update service. Please try again.');
        }
      });
    } else {
      // Create new service with tenant ID
      this.serviceService.createService(serviceData, this.tenantId).subscribe({
        next: () => {
          this.loadServices();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error creating service:', err);
          alert('Failed to create service. Please try again.');
        }
      });
    }
  }

  deleteService(service: Service) {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    this.serviceService.deleteService(service.id).subscribe({
      next: () => {
        this.loadServices();
      },
      error: (err) => {
        console.error('Error deleting service:', err);
        alert('Failed to delete service. Please try again.');
      }
    });
  }

  toggleActive(service: Service) {
    this.serviceService.updateService(service.id, { isActive: !service.isActive }).subscribe({
      next: () => {
        this.loadServices();
      },
      error: (err) => {
        console.error('Error toggling service status:', err);
        alert('Failed to update service status. Please try again.');
      }
    });
  }
}

