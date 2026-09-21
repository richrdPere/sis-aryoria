import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// IziToast
import iziToast from 'izitoast';

// Services
import { AuthService } from 'src/app/core/auth/auth.service';

// Interfaces
import { AuthRoleName, LoginRequest } from 'src/app/core/auth/interfaces';
import { ApiErrorData } from 'src/app/core/interfaces/api-error-data.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent implements OnInit {

  // =========================================================
  // Formulario
  // =========================================================
  formLogin!: FormGroup;

  // =========================================================
  // Estado
  // =========================================================
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // =========================================================
  // Constructor
  // =========================================================

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  // =========================================================
  // Ciclo de vida
  // =========================================================

  ngOnInit(): void {
    this.initializeForm();

    /*
     * Si el usuario ya tiene un access token vigente,
     * no debe permanecer en el login.
     */
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  // =========================================================
  // Inicializar formulario
  // =========================================================
  private initializeForm(): void {
    this.formLogin = this.fb.nonNullable.group({
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
        ],
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
        ],
      ],
    });
  }

  // =========================================================
  // Getters del formulario
  // =========================================================
  get usernameControl() {
    return this.formLogin.controls['username'];
  }

  get passwordControl() {
    return this.formLogin.controls['password'];
  }

  // =========================================================
  // Mostrar u ocultar contraseña
  // =========================================================

  togglePasswordVisibility(): void {
    this.showPassword.update(
      (value) => !value,
    );
  }

  // =========================================================
  // Login
  // =========================================================
  login(): void {
    if (this.loading()) {
      return;
    }

    this.errorMessage.set(null);

    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();

      iziToast.warning({
        title: 'Formulario incompleto',
        message: 'Revisa el usuario y la contraseña.',
        position: 'bottomRight',
      });

      return;
    }

    const { username, password } = this.formLogin.getRawValue();

    const request: LoginRequest = {
      username: username.trim(),
      password,
    };

    this.loading.set(true);

    this.authService
      .login(request)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          iziToast.success({
            title: 'Bienvenido',
            message: response.message || 'Inicio de sesión exitoso.',
            position: 'bottomRight',
          });

          this.redirectByRole();
        },

        error: (
          error: ApiErrorData,
        ) => {
          const message = error.message || 'No se pudo iniciar sesión.';

          this.errorMessage.set(
            message,
          );

          iziToast.error({
            title: 'No se pudo ingresar',
            message,
            position: 'bottomRight',
          });
        },
      });
  }

  // =========================================================
  // Redirección por rol
  // =========================================================
  private redirectByRole(): void {
    const roles = this.authService.getCurrentRoles();
    const destination = this.getDestinationByRoles(roles);

    void this.router.navigate(
      [destination],
      {
        replaceUrl: true,
      },
    );
  }

  private getDestinationByRoles(
    roles: readonly AuthRoleName[],
  ): string {
    if (roles.includes('SUPER_ADMIN')) {
      return '/admin/dashboard';
    }

    if (
      roles.some(
        (role) =>
          [
            'ADMIN',
            'CONTADOR',
            'EMPLEADO',
            'USUARIO',
          ].includes(role),
      )
    ) {
      return '/admin/dashboard';
    }

    return '/auth/login';
  }
}
