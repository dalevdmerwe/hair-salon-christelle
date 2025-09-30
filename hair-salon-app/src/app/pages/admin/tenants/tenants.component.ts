import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Tenant } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss']
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = true;
  error: string | null = null;
  
  // Form state
  showForm = false;
  editingTenant: Tenant | null = null;
  
  // Form model
  tenantForm = {
    id: '',
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    imageUrl: '',
    businessHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    isActive: true
  };

  // Image upload state
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploading = false;

  constructor(
    private tenantService: TenantService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.loading = true;
    this.error = null;
    
    this.tenantService.getAllTenants().subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenants:', err);
        this.error = 'Failed to load tenants. Please try again.';
        this.loading = false;
      }
    });
  }

  openCreateForm() {
    this.editingTenant = null;
    this.tenantForm = {
      id: '',
      name: '',
      slug: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      imageUrl: '',
      businessHours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      },
      isActive: true
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
  }

  openEditForm(tenant: Tenant) {
    this.editingTenant = tenant;
    this.tenantForm = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      imageUrl: tenant.imageUrl || '',
      businessHours: {
        monday: tenant.businessHours?.monday || '',
        tuesday: tenant.businessHours?.tuesday || '',
        wednesday: tenant.businessHours?.wednesday || '',
        thursday: tenant.businessHours?.thursday || '',
        friday: tenant.businessHours?.friday || '',
        saturday: tenant.businessHours?.saturday || '',
        sunday: tenant.businessHours?.sunday || ''
      },
      isActive: tenant.isActive
    };
    this.selectedFile = null;
    this.imagePreview = tenant.imageUrl || null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingTenant = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.tenantForm.imageUrl = '';
  }

  generateSlug() {
    // Auto-generate slug from name
    this.tenantForm.slug = this.tenantForm.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async saveTenant() {
    if (!this.tenantForm.name || !this.tenantForm.slug) {
      alert('Please fill in all required fields.');
      return;
    }

    this.uploading = true;

    try {
      let imageUrl = this.tenantForm.imageUrl;

      // Upload image if a new file was selected
      if (this.selectedFile) {
        const fileName = `${this.tenantForm.slug}-${Date.now()}.${this.selectedFile.name.split('.').pop()}`;
        const filePath = `tenants/${fileName}`;

        const { url, error } = await this.supabaseService.uploadFile('tenant-images', filePath, this.selectedFile);

        if (error) {
          console.error('Upload error:', error);
          alert('Failed to upload image. Please try again.');
          this.uploading = false;
          return;
        }

        imageUrl = url || '';
      }

      const tenantData: Partial<Tenant> = {
        name: this.tenantForm.name,
        slug: this.tenantForm.slug,
        description: this.tenantForm.description || null,
        email: this.tenantForm.email || null,
        phone: this.tenantForm.phone || null,
        address: this.tenantForm.address || null,
        imageUrl: imageUrl || null,
        businessHours: this.tenantForm.businessHours,
        isActive: this.tenantForm.isActive
      };

      if (this.editingTenant) {
        // Update existing tenant
        this.tenantService.updateTenant(this.editingTenant.id, tenantData).subscribe({
          next: () => {
            this.uploading = false;
            this.loadTenants();
            this.closeForm();
          },
          error: (err) => {
            console.error('Error updating tenant:', err);
            alert('Failed to update tenant. Please try again.');
            this.uploading = false;
          }
        });
      } else {
        // Create new tenant
        this.tenantService.createTenant(tenantData).subscribe({
          next: () => {
            this.uploading = false;
            this.loadTenants();
            this.closeForm();
          },
          error: (err) => {
            console.error('Error creating tenant:', err);
            alert('Failed to create tenant. Please try again.');
            this.uploading = false;
          }
        });
      }
    } catch (error) {
      console.error('Error in saveTenant:', error);
      alert('An error occurred. Please try again.');
      this.uploading = false;
    }
  }

  deleteTenant(tenant: Tenant) {
    if (!confirm(`Are you sure you want to delete "${tenant.name}"? This will also delete all associated services.`)) {
      return;
    }

    this.tenantService.deleteTenant(tenant.id).subscribe({
      next: () => {
        this.loadTenants();
      },
      error: (err) => {
        console.error('Error deleting tenant:', err);
        alert('Failed to delete tenant. Please try again.');
      }
    });
  }

  toggleActive(tenant: Tenant) {
    this.tenantService.updateTenant(tenant.id, { isActive: !tenant.isActive }).subscribe({
      next: () => {
        this.loadTenants();
      },
      error: (err) => {
        console.error('Error toggling tenant status:', err);
        alert('Failed to update tenant status. Please try again.');
      }
    });
  }

  goToServices(tenant: Tenant) {
    this.router.navigate(['/admin', tenant.id, 'services']);
  }

  goToBookings(tenant: Tenant) {
    this.router.navigate(['/admin', tenant.id, 'bookings']);
  }
}

