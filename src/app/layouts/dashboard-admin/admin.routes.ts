import { Routes } from '@angular/router';
import { LayoutAdminComponent } from './layout-admin/layout-admin.component';
import { AppLayoutComponent } from 'src/app/shared/layout/app-layout/app-layout.component';


export const adminRoutes: Routes = [

  // --- Layout admin ---
  {
    path: '',
    component: LayoutAdminComponent,
    // component: AppLayoutComponent,
    data: {
      roles: ['ADMIN', 'CLIENTE', 'EMPLEADO'],

    },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../../pages/module/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../../pages/module/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'empresas',
        loadComponent: () =>
          import('../../pages/module/empresas/empresas.component')
            .then(m => m.EmpresasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('../../pages/module/compras/compras.component')
            .then(m => m.ComprasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('../../pages/module/ventas/ventas.component')
            .then(m => m.VentasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'compras-ventas',
        loadComponent: () =>
          import('../../pages/module/compras-ventas/compras-ventas.component')
            .then(m => m.ComprasVentasComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'ingresos',
        loadComponent: () =>
          import('../../pages/module/ingresos/ingresos.component')
            .then(m => m.IngresosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'egresos',
        loadComponent: () =>
          import('../../pages/module/egresos/egresos.component')
            .then(m => m.EgresosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
      {
        path: 'ingresos-egresos',
        loadComponent: () =>
          import('../../pages/module/ingresos-egresos/ingresos-egresos.component')
            .then(m => m.IngresosEgresosComponent),
        data: { roles: ['ADMIN', 'EMPLEADO'] }
      },
    ]
  }
];
