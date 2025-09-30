import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Tenant } from '../../../core/models/tenant.model';
import { AdminToolbarComponent } from '../../../components/admin-toolbar/admin-toolbar.component';

declare var google: any;

@Component({
  selector: 'app-edit-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminToolbarComponent],
  templateUrl: './edit-tenant.component.html',
  styleUrls: ['./edit-tenant.component.scss']
})
export class EditTenantComponent implements OnInit {
  tenantId: string = '';
  tenant: Tenant | null = null;
  loading = true;
  uploading = false;
  
  @ViewChild('addressInput') addressInput!: ElementRef;
  autocomplete: any = null;
  
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

  // Image upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService,
    private supabaseService: SupabaseService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
      if (this.tenantId) {
        this.loadTenant();
      }
    });
  }

  private loadTenant() {
    this.tenantService.getTenantById(this.tenantId).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.populateForm(tenant ? tenant: {} as Tenant);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
        alert('Failed to load tenant. Redirecting...');
        this.router.navigate(['/admin/tenants']);
      }
    });
  }

  private populateForm(tenant: Tenant) {
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

    if (tenant.imageUrl) {
      this.imagePreview = tenant.imageUrl;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
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

        imageUrl = url || imageUrl;
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

      this.tenantService.updateTenant(this.tenantId, tenantData).subscribe({
        next: () => {
          this.uploading = false;
          alert('Tenant updated successfully!');
          this.router.navigate(['/admin/tenants']);
        },
        error: (err) => {
          console.error('Error updating tenant:', err);
          alert('Failed to update tenant. Please try again.');
          this.uploading = false;
        }
      });
    } catch (error) {
      console.error('Error in saveTenant:', error);
      alert('An error occurred. Please try again.');
      this.uploading = false;
    }
  }

  cancel() {
    this.router.navigate(['/admin/{{tenant.id}}']);
  }

  initAddressAutocomplete() {
    if (this.autocomplete || !this.addressInput) {
      return;
    }

    const initAutocomplete = () => {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.warn('Google Maps API not loaded yet. Retrying...');
        setTimeout(initAutocomplete, 500);
        return;
      }

      try {
        this.autocomplete = new google.maps.places.Autocomplete(
          this.addressInput.nativeElement,
          {
            types: ['address'],
            componentRestrictions: { country: 'za' }
          }
        );

        this.autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place = this.autocomplete.getPlace();

            if (place.formatted_address) {
              this.tenantForm.address = place.formatted_address;
            }
          });
        });

        console.log('Address autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing address autocomplete:', error);
      }
    };

    initAutocomplete();
  }
}

