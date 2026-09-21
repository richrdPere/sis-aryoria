import { Routes } from '@angular/router';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // =========================================================
  // Layout auth
  // =========================================================
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(
      (m) => m.AuthLayoutComponent
    ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),

      },
      // {
      //   path: 'register',

      //   loadComponent: () =>
      //     import(
      //       './pages/auth/register/register.component'
      //     ).then(
      //       (module) =>
      //         module.RegisterComponent,
      //     ),
      // },
      {
        path: '',

        pathMatch: 'full',

        redirectTo: 'login',
      },
    ]
    //loadChildren: () => import('./layouts/dashboard-auth/auth.routes').then((m) => m.authRoutes),
  },

  // =========================================================
  // Layout admin
  // =========================================================
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: {
      roles: [
        'SUPER_ADMIN',
        'ADMIN',
        'EMPLEADO',
        'CONTADOR',
        'USUARIO'
      ],
    },
    loadChildren: () => import('./pages/module/admin.routes').then((m) => m.adminRoutes),
  },

  // =========================================================
  // Acceso denegado
  // =========================================================
  {
    path: 'acceso-denegado',
    loadComponent: () => import('./shared/pages/access-denied/access-denied.component').then(
      m => m.AccessDeniedComponent),
  },

  // =========================================================
  // Página no encontrada
  // =========================================================
  {
    path: '**',
    loadComponent: () => import('./shared/pages/no-found-page/no-found-page.component').then(
      (m) => m.NoFoundPageComponent
    ),
  },
];
