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

  // Get all services (admin)
  getAllServices(): Observable<Service[]> {
    return from(
      this.supabase.from('services')
        .select('*')
        .order('name')
    ).pipe(
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

  // Map database row to Service model
  private mapToService(data: any): Service {
    return {
      id: data.id,
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

