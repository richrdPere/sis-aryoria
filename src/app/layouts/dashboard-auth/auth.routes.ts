import { Routes } from '@angular/router';
import { DashAuthComponent } from './dash-auth/dash-auth.component';


export const authRoutes: Routes = [

  // --- Layout auth ---
  {
    path: '',
    component: DashAuthComponent,
    children: [
      //{ path: '', redirectTo: '/auth', pathMatch: 'full' },
      {
        path: '',
        loadComponent: () =>
          import('../../pages/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        // ----------------------------
        //  Auth
        // ----------------------------
        path: 'login',
        loadComponent: () => import('../../pages/auth/login/login.component').then(m => m.LoginComponent),
      },
    ]
  }
];
