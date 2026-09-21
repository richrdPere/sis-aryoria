import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Service - Auth
import { AuthService } from 'src/app/core/auth/auth.service';

// Interface
import { AuthUser } from 'src/app/core/auth/interfaces';

interface AdminNavigationItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

interface AdminNavigationGroup {
  title: string;
  items: AdminNavigationItem[];
}


@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './admin-layout.component.html',
  styles: ``
})
export class AdminLayoutComponent {

  // =========================================================
  // Dependencias
  // =========================================================
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // Estado
  // =========================================================
  readonly sidebarOpen = signal(false);
  readonly profileMenuOpen = signal(false);
  readonly isDarkMode = signal(false);
  readonly isLoggingOut = signal(false);
  readonly currentUser = signal<AuthUser | null>(
    this.authService.getCurrentUser(),
  );

  // =========================================================
  // Navegación
  // =========================================================

  readonly navigationGroups:
    AdminNavigationGroup[] = [
      {
        title:
          'General',

        items: [
          {
            label:
              'Dashboard',

            icon:
              'fa-solid fa-chart-pie',

            route:
              '/admin/dashboard',

            exact:
              true,
          },
        ],
      },
      {
        title:
          'Clientes',

        items: [
          {
            label:
              'Empresas',

            icon:
              'fa-solid fa-building',

            route:
              '/admin/empresas',
          },
          {
            label:
              'Usuarios',

            icon:
              'fa-solid fa-users',

            route:
              '/admin/usuarios',
          },
        ],
      },
      {
        title:
          'Suscripciones',

        items: [
          {
            label:
              'Planes',

            icon:
              'fa-solid fa-layer-group',

            route:
              '/admin/planes',
          },
          {
            label:
              'Suscripciones',

            icon:
              'fa-solid fa-rotate',

            route:
              '/admin/suscripciones',
          },
          {
            label:
              'Pagos',

            icon:
              'fa-solid fa-credit-card',

            route:
              '/admin/pagos',
          },
        ],
      },
      {
        title:
          'Análisis',

        items: [
          {
            label:
              'Reportes',

            icon:
              'fa-solid fa-chart-column',

            route:
              '/admin/reportes',
          },
          {
            label:
              'Auditoría',

            icon:
              'fa-solid fa-clock-rotate-left',

            route:
              '/admin/auditoria',
          },
        ],
      },
      {
        title:
          'Sistema',

        items: [
          {
            label:
              'Configuración',

            icon:
              'fa-solid fa-gear',

            route:
              '/admin/configuracion',
          },
        ],
      },
    ];

  // =========================================================
  // Valores calculados
  // =========================================================

  readonly userFullName =
    computed(() => {
      const user =
        this.currentUser();

      const person =
        user?.persona;

      if (person) {
        return [
          person.nombres,
          person.apellidos,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();
      }

      return (
        user?.username
        || 'Administrador'
      );
    });

  readonly userInitials = computed(() => {
    const fullName = this.userFullName().trim();

    if (!fullName) {
      return 'AD';
    }

    const parts = fullName.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0]
      + parts[1][0]
    ).toUpperCase();
  });

  readonly userRole = computed(() => {
    const roles = this.currentUser()?.roles ?? [];

    if (roles.includes('SUPER_ADMIN')) {
      return 'Superadministrador';
    }

    if (roles.includes('ADMIN')) {
      return 'Administrador';
    }

    if (roles.includes('CONTADOR')) {
      return 'Contador';
    }

    if (roles.includes('EMPLEADO')) {
      return 'Empleado';
    }

    if (roles.includes('USUARIO')) {
      return 'Usuario';
    }

    return 'Sin rol';
  });

  // =========================================================
  // Constructor
  // =========================================================

  constructor() {
    this.initializeUser();
    this.initializeTheme();
    this.listenRouterEvents();
  }

  // =========================================================
  // Usuario
  // =========================================================

  private initializeUser(): void {
    this.authService.currentUser$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe((user) => {
        this.currentUser.set(user);
      });
  }

  // =========================================================
  // Router
  // =========================================================

  private listenRouterEvents(): void {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof
            NavigationEnd,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(() => {
        this.sidebarOpen.set(false);
        this.profileMenuOpen.set(false);
      });
  }

  // =========================================================
  // Sidebar
  // =========================================================

  toggleSidebar(): void {
    this.sidebarOpen.update(
      (value) => !value,
    );
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  // =========================================================
  // Perfil
  // =========================================================

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(
      (value) => !value,
    );
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  goToProfile(): void {
    this.closeProfileMenu();

    void this.router.navigate([
      '/admin/perfil',
    ]);
  }

  // =========================================================
  // Tema
  // =========================================================

  private initializeTheme(): void {
    const storedTheme =
      localStorage.getItem(
        'aryoria_web_theme',
      );

    const prefersDark =
      window.matchMedia?.(
        '(prefers-color-scheme: dark)',
      ).matches;

    const darkMode =
      storedTheme
        ? storedTheme === 'dark'
        : Boolean(prefersDark);

    this.applyTheme(darkMode);
  }

  toggleTheme(): void {
    this.applyTheme(
      !this.isDarkMode(),
    );
  }

  private applyTheme(
    darkMode: boolean,
  ): void {
    this.isDarkMode.set(
      darkMode,
    );

    const theme =
      darkMode
        ? 'dark'
        : 'light';

    document.documentElement
      .setAttribute(
        'data-theme',
        theme,
      );

    localStorage.setItem(
      'aryoria_web_theme',
      theme,
    );
  }

  // =========================================================
  // Logout
  // =========================================================

  logout(): void {
    if (
      this.isLoggingOut()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        '¿Deseas cerrar tu sesión en Aryoria?',
      );

    if (!confirmed) {
      return;
    }

    this.isLoggingOut.set(
      true,
    );

    this.profileMenuOpen.set(
      false,
    );

    this.authService.logout()
      .pipe(
        finalize(() => {
          this.isLoggingOut.set(
            false,
          );
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(
            ['/auth/login'],
            {
              replaceUrl: true,
            },
          );
        },

        error: () => {
          /*
           * AuthService elimina la sesión local
           * mediante finalize aunque el backend falle.
           */
          void this.router.navigate(
            ['/auth/login'],
            {
              replaceUrl: true,
            },
          );
        },
      });
  }
}
