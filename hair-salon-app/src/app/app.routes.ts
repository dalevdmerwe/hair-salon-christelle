import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'admin/tenants',
    loadComponent: () => import('./pages/admin/tenants/tenants.component').then(m => m.TenantsComponent)
  },
  {
    path: 'admin/:tenantId/services',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'admin/:tenantId/bookings',
    loadComponent: () => import('./pages/admin/bookings/bookings.component').then(m => m.BookingsComponent)
  },
  {
    path: 'admin',
    redirectTo: 'admin/tenants',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
