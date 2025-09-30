import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: false, // Disable session persistence to avoid lock issues
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  }

  get client() {
    return this.supabase;
  }

  // Helper method to get data from a table
  from(table: string) {
    return this.supabase.from(table);
  }

  // Upload file to storage
  async uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: any }> {
    try {
      // Upload file
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        return { url: null, error };
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Upload exception:', error);
      return { url: null, error };
    }
  }

  // Delete file from storage
  async deleteFile(bucket: string, path: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      return { error };
    } catch (error) {
      console.error('Delete exception:', error);
      return { error };
    }
  }
}

