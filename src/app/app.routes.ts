import { Routes } from '@angular/router';

// Guard
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // --- Layout publico ---
  {
    path: '',
    loadChildren: () => import('./layouts/dashboard-auth/auth.routes').then((m) => m.authRoutes),
  },
  // --- Layout Admin (rutas privadas, lazy loading)
  {
    path: 'main',
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'cliente', 'empleado'] },
    loadChildren: () => import('./layouts/dashboard-admin/admin.routes').then((m) => m.adminRoutes),
  },


  // ✅ CORREGIDO: ÚNICA ruta comodín en toda la aplicación
  // {
  //   path: '**',
  //   loadComponent: () =>
  //     import('./pages/shared/not-found/not-found.component').then(
  //       (m) => m.NotFoundComponent
  //     ),
  // },


];
