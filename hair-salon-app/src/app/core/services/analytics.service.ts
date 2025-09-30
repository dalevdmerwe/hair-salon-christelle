import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface SiteVisit {
  id?: string;
  tenantId: string;
  pagePath: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId: string;
  visitorId: string;
  country?: string;
  city?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  createdAt?: Date;
}

export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  avgDailyVisits: number;
  mobilePercentage: number;
  desktopPercentage: number;
  tabletPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private sessionId: string;
  private visitorId: string;

  constructor(private supabaseService: SupabaseService) {
    // Get or create session ID (expires when browser closes)
    this.sessionId = sessionStorage.getItem('session_id') || this.generateUUID();
    sessionStorage.setItem('session_id', this.sessionId);

    // Get or create visitor ID (persists across sessions)
    this.visitorId = localStorage.getItem('visitor_id') || this.generateUUID();
    localStorage.setItem('visitor_id', this.visitorId);
  }

  /**
   * Generate a simple UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Track a page visit
   */
  trackPageVisit(tenantId: string, pagePath: string): Observable<any> {
    const visit: Partial<SiteVisit> = {
      tenantId,
      pagePath,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(),
      os: this.detectOS()
    };

    const dbData = {
      tenant_id: visit.tenantId,
      page_path: visit.pagePath,
      referrer: visit.referrer,
      user_agent: visit.userAgent,
      session_id: visit.sessionId,
      visitor_id: visit.visitorId,
      device_type: visit.deviceType,
      browser: visit.browser,
      os: visit.os
    };

    return from(
      this.supabaseService.client
        .from('site_visits')
        .insert(dbData)
    );
  }

  /**
   * Get visit statistics for a tenant
   */
  getVisitStats(tenantId: string, days: number = 30): Observable<VisitStats | null> {
    return from(
      this.supabaseService.client
        .rpc('get_tenant_visit_stats', {
          p_tenant_id: tenantId,
          p_days: days
        })
    ).pipe(
      map((response: any) => {
        if (response.error) {
          console.error('Error fetching visit stats:', response.error);
          return null;
        }
        
        const data = response.data?.[0];
        if (!data) return null;

        return {
          totalVisits: parseInt(data.total_visits) || 0,
          uniqueVisitors: parseInt(data.unique_visitors) || 0,
          uniqueSessions: parseInt(data.unique_sessions) || 0,
          avgDailyVisits: parseFloat(data.avg_daily_visits) || 0,
          mobilePercentage: parseFloat(data.mobile_percentage) || 0,
          desktopPercentage: parseFloat(data.desktop_percentage) || 0,
          tabletPercentage: parseFloat(data.tablet_percentage) || 0
        };
      })
    ) as Observable<VisitStats | null>;
  }

  /**
   * Get daily visit counts for a tenant
   */
  getDailyVisits(tenantId: string, days: number = 30): Observable<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return from(
      this.supabaseService.client
        .from('site_visits')
        .select('created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })
    ).pipe(
      map((response: any) => {
        if (response.error) {
          console.error('Error fetching daily visits:', response.error);
          return [];
        }
        
        // Group by date
        const visitsByDate: { [key: string]: number } = {};
        (response.data || []).forEach((visit: any) => {
          const date = new Date(visit.created_at).toISOString().split('T')[0];
          visitsByDate[date] = (visitsByDate[date] || 0) + 1;
        });

        return Object.entries(visitsByDate).map(([date, count]) => ({
          date,
          count
        }));
      })
    ) as Observable<any[]>;
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Detect browser
   */
  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Detect operating system
   */
  private detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }
}

