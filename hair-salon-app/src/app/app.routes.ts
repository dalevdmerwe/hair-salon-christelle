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
    path: 'admin/tenant/:tenantId/edit',
    loadComponent: () => import('./pages/admin/edit-tenant/edit-tenant.component').then(m => m.EditTenantComponent)
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
    path: 'admin/:tenantId',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
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
