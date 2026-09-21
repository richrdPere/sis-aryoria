import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

export const adminRoutes: Routes = [

  // --- Layout admin ---
  {
    path: '',
    component: AdminLayoutComponent,
    // component: LayoutAdminComponent,
    // component: AppLayoutComponent,
    data: {
      roles: [
        'SUPER_ADMIN',
        'ADMIN',
        'EMPLEADO',
        'CONTADOR',
        'USUARIO'
      ],
    },
    children: [

      // *****************************************************
      // RUTAS ADMIN MODULOS
      // *****************************************************
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./usuarios/usuarios.component')
            .then(m => m.UsuariosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'empresas',
        loadComponent: () =>
          import('./empresas/empresas.component')
            .then(m => m.EmpresasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./compras/compras.component')
            .then(m => m.ComprasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./ventas/ventas.component')
            .then(m => m.VentasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'compras-ventas',
        loadComponent: () =>
          import('./compras-ventas/compras-ventas.component')
            .then(m => m.ComprasVentasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'ingresos',
        loadComponent: () =>
          import('./ingresos/ingresos.component')
            .then(m => m.IngresosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'egresos',
        loadComponent: () =>
          import('./egresos/egresos.component')
            .then(m => m.EgresosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'ingresos-egresos',
        loadComponent: () =>
          import('./ingresos-egresos/ingresos-egresos.component')
            .then(m => m.IngresosEgresosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },


      // *****************************************************
      // REDIRECCIÓN INTERNA
      // *****************************************************
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ]
  }
];

export default adminRoutes;
