import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Tenant } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  constructor(private supabase: SupabaseService) {}

  // Get all tenants
  getAllTenants(): Observable<Tenant[]> {
    return from(
      this.supabase.from('tenants')
        .select('*')
        .order('name')
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching tenants:', response.error);
          return [];
        }
        return (response.data || []).map(this.mapToTenant);
      }),
      catchError(error => {
        console.error('Error in getAllTenants:', error);
        return of([]);
      })
    );
  }

  // Get active tenants only
  getActiveTenants(): Observable<Tenant[]> {
    return from(
      this.supabase.from('tenants')
        .select('*')
        .eq('is_active', true)
        .order('name')
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching active tenants:', response.error);
          return [];
        }
        return (response.data || []).map(this.mapToTenant);
      }),
      catchError(error => {
        console.error('Error in getActiveTenants:', error);
        return of([]);
      })
    );
  }

  // Get tenant by ID
  getTenantById(id: string): Observable<Tenant | null> {
    return from(
      this.supabase.from('tenants')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching tenant:', response.error);
          return null;
        }
        return response.data ? this.mapToTenant(response.data) : null;
      }),
      catchError(error => {
        console.error('Error in getTenantById:', error);
        return of(null);
      })
    );
  }

  // Get tenant by slug
  getTenantBySlug(slug: string): Observable<Tenant | null> {
    return from(
      this.supabase.from('tenants')
        .select('*')
        .eq('slug', slug)
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching tenant by slug:', response.error);
          return null;
        }
        return response.data ? this.mapToTenant(response.data) : null;
      }),
      catchError(error => {
        console.error('Error in getTenantBySlug:', error);
        return of(null);
      })
    );
  }

  // Create a new tenant
  createTenant(tenant: Partial<Tenant>): Observable<Tenant | null> {
    const dbData = {
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      image_url: tenant.imageUrl,
      is_active: tenant.isActive ?? true
    };

    return from(
      this.supabase.from('tenants')
        .insert(dbData)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error creating tenant:', response.error);
          return null;
        }
        return response.data ? this.mapToTenant(response.data) : null;
      }),
      catchError(error => {
        console.error('Error in createTenant:', error);
        return of(null);
      })
    );
  }

  // Update an existing tenant
  updateTenant(id: string, updates: Partial<Tenant>): Observable<Tenant | null> {
    const dbData: any = {};

    if (updates.name !== undefined) dbData.name = updates.name;
    if (updates.slug !== undefined) dbData.slug = updates.slug;
    if (updates.description !== undefined) dbData.description = updates.description;
    if (updates.email !== undefined) dbData.email = updates.email;
    if (updates.phone !== undefined) dbData.phone = updates.phone;
    if (updates.address !== undefined) dbData.address = updates.address;
    if (updates.imageUrl !== undefined) dbData.image_url = updates.imageUrl;
    if (updates.isActive !== undefined) dbData.is_active = updates.isActive;

    return from(
      this.supabase.from('tenants')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error updating tenant:', response.error);
          return null;
        }
        return response.data ? this.mapToTenant(response.data) : null;
      }),
      catchError(error => {
        console.error('Error in updateTenant:', error);
        return of(null);
      })
    );
  }

  // Delete a tenant
  deleteTenant(id: string): Observable<boolean> {
    return from(
      this.supabase.from('tenants')
        .delete()
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error deleting tenant:', response.error);
          return false;
        }
        return true;
      }),
      catchError(error => {
        console.error('Error in deleteTenant:', error);
        return of(false);
      })
    );
  }

  // Map database row to Tenant model
  private mapToTenant(data: any): Tenant {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      email: data.email,
      phone: data.phone,
      address: data.address,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }
}

