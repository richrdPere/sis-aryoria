import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Services
import { AuthService } from '../auth/auth.service';

// Interfaces
import { AuthRoleName } from '../auth/interfaces';

// ==========================================================
// ROLE GUARD
// ==========================================================
export const RoleGuard: CanActivateFn = (
  route,
  state,
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // ========================================================
  // 1. Validar autenticación
  // ========================================================
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(
      ['/login'],
      {
        queryParams: {
          returnUrl: state.url,
        },
      },
    );
  }

  // ========================================================
  // 2. Obtener roles del usuario autenticado
  // ========================================================
  const userRoles = authService.getCurrentRoles();

  // ========================================================
  // 3. Obtener roles permitidos por la ruta
  // ========================================================
  const routeRoles = route.data?.['roles'];

  const allowedRoles: readonly AuthRoleName[] = Array.isArray(routeRoles)
    ? routeRoles.filter(
      (
        role,
      ): role is AuthRoleName =>
        isAuthRoleName(role),
    )
    : [];

  // ========================================================
  // 4. Ruta sin restricciones por roles
  // ========================================================
  if (allowedRoles.length === 0) {
    return true;
  }

  // ========================================================
  // 5. Verificar coincidencia de roles
  // ========================================================
  const hasAllowedRole = userRoles.some(
    (userRole) =>
      allowedRoles.includes(userRole),
  );

  if (hasAllowedRole) {
    return true;
  }

  // ========================================================
  // 6. Acceso denegado
  // ========================================================
  return router.createUrlTree(
    ['/acceso-denegado'],
  );
};

// ==========================================================
// VALIDAR NOMBRE DE ROL
// ==========================================================
const VALID_AUTH_ROLES: readonly AuthRoleName[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'EMPLEADO',
  'CONTADOR',
  'USUARIO',
];

const isAuthRoleName = (value: unknown): value is AuthRoleName => {
  if (typeof value !== 'string') {
    return false;
  }

  return (VALID_AUTH_ROLES as readonly string[]).includes(
    value.trim().toUpperCase(),
  );
};
