import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Service } from '../models/service.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor(private supabase: SupabaseService) {}

  // Get all active services from Supabase
  getActiveServices(): Observable<Service[]> {
    return from(
      this.supabase.from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching services:', response.error);
          return [];
        }
        return (response.data || []).map(this.mapToService);
      }),
      catchError(error => {
        console.error('Error in getActiveServices:', error);
        return of([]);
      })
    );
  }

  // Get all services (admin) - optionally filtered by tenant
  getAllServices(tenantId?: string): Observable<Service[]> {
    let query = this.supabase.from('services').select('*');

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    return from(query.order('name')).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching all services:', response.error);
          return [];
        }
        return (response.data || []).map(this.mapToService);
      }),
      catchError(error => {
        console.error('Error in getAllServices:', error);
        return of([]);
      })
    );
  }

  // Get service by ID
  getServiceById(id: string): Observable<Service | undefined> {
    return from(
      this.supabase.from('services')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching service:', response.error);
          return undefined;
        }
        return response.data ? this.mapToService(response.data) : undefined;
      }),
      catchError(error => {
        console.error('Error in getServiceById:', error);
        return of(undefined);
      })
    );
  }

  // Create a new service
  createService(service: Partial<Service>, tenantId?: string): Observable<Service | null> {
    const dbData: any = {
      tenant_id: tenantId || service.tenantId || null,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      is_active: service.isActive ?? true
    };

    return from(
      this.supabase.from('services')
        .insert(dbData)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error creating service:', response.error);
          return null;
        }
        return response.data ? this.mapToService(response.data) : null;
      }),
      catchError(error => {
        console.error('Error in createService:', error);
        return of(null);
      })
    );
  }

  // Update an existing service
  updateService(id: string, updates: Partial<Service>): Observable<Service | null> {
    const dbData: any = {};

    if (updates.name !== undefined) dbData.name = updates.name;
    if (updates.description !== undefined) dbData.description = updates.description;
    if (updates.duration !== undefined) dbData.duration = updates.duration;
    if (updates.price !== undefined) dbData.price = updates.price;
    if (updates.isActive !== undefined) dbData.is_active = updates.isActive;

    return from(
      this.supabase.from('services')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error updating service:', response.error);
          return null;
        }
        return response.data ? this.mapToService(response.data) : null;
      }),
      catchError(error => {
        console.error('Error in updateService:', error);
        return of(null);
      })
    );
  }

  // Delete a service
  deleteService(id: string): Observable<boolean> {
    return from(
      this.supabase.from('services')
        .delete()
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error deleting service:', response.error);
          return false;
        }
        return true;
      }),
      catchError(error => {
        console.error('Error in deleteService:', error);
        return of(false);
      })
    );
  }

  // Map database row to Service model
  private mapToService(data: any): Service {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      isActive: data.is_active,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }
}

