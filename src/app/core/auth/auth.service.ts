
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

// Environment
import { environment } from './../../../environments/environment';

// Storage
import { AuthStorageService, StoredSession, TokenExpiration } from './auth-storage.service';

// Helpers
import { HttpServiceHelper } from './http-service.helper';

// ApiResponse
import { ApiResponse } from '../interfaces/api-response.model';

// Interfaces de autenticación
import { AuthRoleName, AuthUser, LoginRequest, LoginResponse, LogoutResponse, RefreshTokenResponse, RegisterRequest, RegisterResponse } from './interfaces';

// =========================================================
// Respuesta común procesable
// =========================================================

type AuthenticationResponse =
  | LoginResponse
  | RegisterResponse
  | RefreshTokenResponse;

// =========================================================
// Payload real del access token de Aryoria
// =========================================================

export interface AuthJwtPayload {
  id_usuario: number;
  roles: AuthRoleName[];
  tipo: 'access' | 'refresh';
  iat: number;
  exp: number;
  sub: string;
  jti?: string;
}

// =========================================================
// Perfil
// =========================================================

export type GetMeResponse =
  ApiResponse<AuthUser>;

// =========================================================
// Logout de todos los dispositivos
// =========================================================

export interface LogoutAllData {
  sessions_closed: number;
  current_session_preserved: boolean;
}

export type LogoutAllResponse =
  ApiResponse<LogoutAllData>;

// =========================================================
// Cambiar contraseña
// =========================================================

export interface ChangePasswordRequest {
  password_actual: string;
  nueva_password: string;
  confirmar_password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // =========================================================
  // Dependencias
  // =========================================================

  private readonly http =
    inject(HttpClient);

  private readonly authStorage =
    inject(AuthStorageService);

  private readonly jwtHelper =
    new JwtHelperService();

  // =========================================================
  // Endpoints
  // =========================================================

  private readonly API_BASE =
    `${environment.main_url.replace(/\/+$/, '')}/auth`;

  private readonly API_LOGIN =
    `${this.API_BASE}/login`;

  private readonly API_REGISTER =
    `${this.API_BASE}/register`;

  private readonly API_LOGOUT =
    `${this.API_BASE}/logout`;

  private readonly API_LOGOUT_ALL =
    `${this.API_BASE}/logout-all`;

  private readonly API_REFRESH =
    `${this.API_BASE}/refresh-token`;

  private readonly API_ME =
    `${this.API_BASE}/me`;

  private readonly API_CHANGE_PASSWORD =
    `${this.API_BASE}/change-password`;

  // =========================================================
  // Estado
  // =========================================================

  private readonly currentUserSubject =
    new BehaviorSubject<AuthUser | null>(
      null,
    );

  readonly currentUser$ =
    this.currentUserSubject
      .asObservable();

  private readonly sessionCheckedSubject =
    new BehaviorSubject<boolean>(
      false,
    );

  readonly sessionChecked$ =
    this.sessionCheckedSubject
      .asObservable();

  // =========================================================
  // Constructor
  // =========================================================

  constructor() {
    this.initializeSession();
  }

  // =========================================================
  // 1. Login
  // =========================================================

  login(
    request: LoginRequest,
  ): Observable<LoginResponse> {
    const deviceId =
      this.authStorage
        .getOrCreateDeviceId();

    const payload: LoginRequest = {
      ...request,

      dispositivo_id:
        deviceId,

      tipo_dispositivo:
        'WEB',

      nombre_dispositivo:
        request.nombre_dispositivo
        || this.getBrowserName(),
    };

    return this.http.post<LoginResponse>(
      this.API_LOGIN,
      payload,
      {
        headers:
          this.getJsonHeaders(),

        withCredentials:
          true,
      },
    ).pipe(
      tap((response) => {
        this.processAuthResponse(
          response,
        );
      }),

      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudo iniciar sesión.',
        ),
      ),
    );
  }

  // =========================================================
  // 2. Registro público
  // =========================================================

  register(
    request: RegisterRequest,
  ): Observable<RegisterResponse> {
    const deviceId =
      this.authStorage
        .getOrCreateDeviceId();

    const payload: RegisterRequest = {
      ...request,

      dispositivo_id:
        deviceId,

      tipo_dispositivo:
        'WEB',

      nombre_dispositivo:
        request.nombre_dispositivo
        || this.getBrowserName(),
    };

    return this.http.post<RegisterResponse>(
      this.API_REGISTER,
      payload,
      {
        headers:
          this.getJsonHeaders(),

        withCredentials:
          true,
      },
    ).pipe(
      tap((response) => {
        this.processAuthResponse(
          response,
        );
      }),

      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudo registrar el usuario.',
        ),
      ),
    );
  }

  // =========================================================
  // 3. Refresh token
  // =========================================================

  refreshToken():
    Observable<RefreshTokenResponse> {
    const deviceId =
      this.authStorage
        .getOrCreateDeviceId();

    const browserName =
      this.getBrowserName();

    return this.http.post<RefreshTokenResponse>(
      this.API_REFRESH,
      {
        /*
         * No enviamos refresh_token.
         * El navegador lo envía mediante cookie HttpOnly.
         */
        dispositivo_id:
          deviceId,

        tipo_dispositivo:
          'WEB',

        nombre_dispositivo:
          browserName,
      },
      {
        headers:
          HttpServiceHelper.getHeaders({
            extraHeaders: {
              'X-Client-Type':
                'WEB',

              'X-Device-Id':
                deviceId,

              'X-Device-Name':
                browserName,
            },
          }),

        withCredentials:
          true,
      },
    ).pipe(
      tap((response) => {
        this.processAuthResponse(
          response,
        );
      }),

      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudo renovar la sesión.',
        ),
      ),
    );
  }

  // =========================================================
  // 4. Obtener perfil
  // =========================================================

  getMe():
    Observable<GetMeResponse> {
    return this.http.get<GetMeResponse>(
      this.API_ME,
      {
        headers:
          this.getJsonHeaders(),

        withCredentials:
          true,
      },
    ).pipe(
      tap((response) => {
        const usuario =
          response.data;

        const roles =
          this.normalizeRoles(
            usuario.roles,
          );

        this.authStorage.saveUser(
          usuario,
          roles,
        );

        this.currentUserSubject.next(
          usuario,
        );
      }),

      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudo obtener el usuario autenticado.',
        ),
      ),
    );
  }

  // =========================================================
  // 5. Logout
  // =========================================================

  logout():
    Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(
      this.API_LOGOUT,
      {},
      {
        headers:
          this.getJsonHeaders(),

        withCredentials:
          true,
      },
    ).pipe(
      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudo cerrar la sesión en el servidor.',
        ),
      ),

      /*
       * Aunque el backend no responda, limpiamos la
       * información local.
       */
      finalize(() => {
        this.closeLocalSession();
      }),
    );
  }

  // =========================================================
  // 6. Logout de todos los dispositivos
  // =========================================================

  logoutAll():
    Observable<LogoutAllResponse> {
    return this.http.post<LogoutAllResponse>(
      this.API_LOGOUT_ALL,
      {},
      {
        headers:
          this.getJsonHeaders(),

        withCredentials:
          true,
      },
    ).pipe(
      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudieron cerrar todas las sesiones.',
        ),
      ),

      finalize(() => {
        this.closeLocalSession();
      }),
    );
  }

  // =========================================================
  // 7. Cambiar contraseña
  // =========================================================

  changePassword(
    request: ChangePasswordRequest,
  ): Observable<unknown> {
    return this.http.patch(
      this.API_CHANGE_PASSWORD,
      request,
      {
        headers:
          this.getJsonHeaders(),

        withCredentials:
          true,
      },
    ).pipe(
      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudo cambiar la contraseña.',
        ),
      ),
    );
  }

  // =========================================================
  // 8. Restaurar sesión
  // =========================================================

  restoreSession():
    Observable<AuthUser | null> {
    const accessToken =
      this.authStorage
        .getAccessToken();

    const savedUser =
      this.authStorage
        .getUser<AuthUser>();

    // ======================================================
    // Access token válido
    // ======================================================

    if (
      accessToken
      && this.hasValidJwtStructure(
        accessToken,
      )
      && !this.isTokenExpired(
        accessToken,
      )
    ) {
      /*
       * Si también tenemos usuario guardado, restauramos
       * inmediatamente sin hacer una petición adicional.
       */
      if (savedUser) {
        this.currentUserSubject.next(
          savedUser,
        );

        return of(savedUser);
      }

      /*
       * Existe access token, pero no usuario almacenado.
       * Recuperamos el perfil desde el backend.
       */
      return this.getMe().pipe(
        map((response) =>
          response.data,
        ),

        catchError(() => {
          this.closeLocalSession();

          return of(null);
        }),
      );
    }

    // ======================================================
    // Access token expirado: intentar refresh
    // ======================================================

    if (
      this.authStorage
        .hasSessionHint()
    ) {
      return this.refreshToken().pipe(
        /*
         * processAuthResponse() ya almacena el usuario,
         * pero /me garantiza información actualizada.
         */
        switchMap(() =>
          this.getMe(),
        ),

        map((response) =>
          response.data,
        ),

        catchError(() => {
          this.closeLocalSession();

          return of(null);
        }),
      );
    }

    this.closeLocalSession();

    return of(null);
  }

  // =========================================================
  // Inicializar sesión
  // =========================================================

  private initializeSession(): void {
    this.restoreSession()
      .pipe(
        finalize(() => {
          this.sessionCheckedSubject
            .next(true);
        }),
      )
      .subscribe({
        error: () => {
          this.closeLocalSession();

          this.sessionCheckedSubject
            .next(true);
        },
      });
  }

  // =========================================================
  // Procesar respuesta de autenticación
  // =========================================================

  private processAuthResponse(
    response:
      AuthenticationResponse,
  ): void {
    const {
      access_token,
      expires_in,
      sesion,
      usuario,
    } = response.data;

    // ======================================================
    // Validar access token
    // ======================================================

    if (
      !this.hasValidJwtStructure(
        access_token,
      )
    ) {
      throw new Error(
        'El access token recibido no tiene una estructura válida.',
      );
    }

    const payload =
      this.decodeAccessToken(
        access_token,
      );

    if (!payload) {
      throw new Error(
        'No se pudo interpretar el access token recibido.',
      );
    }

    if (payload.tipo !== 'access') {
      throw new Error(
        'El token recibido no es un access token.',
      );
    }

    if (
      Number(payload.id_usuario)
      !== Number(
        usuario.id_usuario,
      )
    ) {
      throw new Error(
        'El access token no pertenece al usuario recibido.',
      );
    }

    // ======================================================
    // Roles
    // ======================================================

    const roles =
      this.normalizeRoles(
        usuario.roles,
      );

    if (roles.length === 0) {
      throw new Error(
        'El usuario autenticado no tiene roles válidos.',
      );
    }

    // ======================================================
    // Sesión
    // ======================================================

    const storedSession:
      StoredSession = {
      sessionId:
        String(
          sesion.id_refresh_token,
        ),

      dispositivoId:
        sesion.dispositivo_id
        || this.authStorage
          .getOrCreateDeviceId(),

      tipoDispositivo:
        sesion.tipo_dispositivo
        || 'WEB',

      fechaExpiracion:
        sesion.fecha_expiracion,
    };

    // ======================================================
    // Expiración
    // ======================================================

    const storedExpiration:
      TokenExpiration = {
      accessToken:
        expires_in.access_token,

      refreshToken:
        expires_in.refresh_token,
    };

    // ======================================================
    // Guardar en almacenamiento local
    // ======================================================

    this.authStorage.saveLogin({
      accessToken:
        access_token,

      expiresIn:
        storedExpiration,

      sesion:
        storedSession,

      roles,
      usuario: {
        ...usuario,
        roles,
      },
    });

    this.currentUserSubject.next({
      ...usuario,
      roles,
    });
  }

  // =========================================================
  // Headers JSON
  // =========================================================

  private getJsonHeaders():
    HttpHeaders {
    return HttpServiceHelper.getHeaders({
      token:
        this.authStorage
          .getAccessToken(),

      extraHeaders: {
        'X-Client-Type':
          'WEB',

        'X-Device-Id':
          this.authStorage
            .getOrCreateDeviceId(),

        'X-Device-Name':
          this.getBrowserName(),
      },
    });
  }

  // =========================================================
  // Normalizar roles
  // =========================================================

  private normalizeRoles(
    roles:
      | readonly AuthRoleName[]
      | readonly string[]
      | null
      | undefined,
  ): AuthRoleName[] {
    if (!Array.isArray(roles)) {
      return [];
    }

    const validRoles =
      new Set<string>([
        'SUPER_ADMIN',
        'ADMIN',
        'EMPLEADO',
        'CONTADOR',
        'USUARIO',
      ]);

    return roles.filter(
      (
        role,
      ): role is AuthRoleName =>
        typeof role === 'string'
        && validRoles.has(role),
    );
  }

  // =========================================================
  // JWT
  // =========================================================

  private hasValidJwtStructure(
    token:
      string | null,
  ): token is string {
    if (!token) {
      return false;
    }

    const normalizedToken = token.replace(
      /^Bearer\s+/i,
      '',
    )
      .trim();

    if (
      !normalizedToken
      || normalizedToken === 'null'
      || normalizedToken ===
      'undefined'
    ) {
      return false;
    }

    const parts =
      normalizedToken.split('.');

    return (
      parts.length === 3
      && parts.every(
        (part) =>
          part.length > 0,
      )
    );
  }

  private isTokenExpired(
    token: string,
  ): boolean {
    try {
      return this.jwtHelper
        .isTokenExpired(token);
    } catch {
      return true;
    }
  }

  decodeAccessToken(
    token?: string | null,
  ): AuthJwtPayload | null {
    const accessToken =
      token
      ?? this.authStorage
        .getAccessToken();

    if (
      !accessToken
      || !this.hasValidJwtStructure(
        accessToken,
      )
    ) {
      return null;
    }

    try {
      return this.jwtHelper
        .decodeToken<AuthJwtPayload>(
          accessToken,
        );
    } catch {
      return null;
    }
  }

  // =========================================================
  // Navegador
  // =========================================================

  private getBrowserName(): string {
    if (
      typeof navigator ===
      'undefined'
    ) {
      return 'Aryoria Web';
    }

    const userAgent =
      navigator.userAgent;

    if (
      userAgent.includes('Edg/')
    ) {
      return 'Microsoft Edge';
    }

    if (
      userAgent.includes(
        'Chrome/',
      )
    ) {
      return 'Google Chrome';
    }

    if (
      userAgent.includes(
        'Firefox/',
      )
    ) {
      return 'Mozilla Firefox';
    }

    if (
      userAgent.includes(
        'Safari/',
      )
    ) {
      return 'Safari';
    }

    return 'Navegador web';
  }

  // =========================================================
  // Limpiar sesión local
  // =========================================================

  closeLocalSession(): void {
    this.authStorage
      .clearSession();

    this.currentUserSubject.next(
      null,
    );
  }

  // =========================================================
  // Getters
  // =========================================================

  getAccessToken():
    string | null {
    return this.authStorage
      .getAccessToken();
  }

  getToken():
    string | null {
    return this.getAccessToken();
  }

  getCurrentUser():
    AuthUser | null {
    return this.currentUserSubject
      .value;
  }

  getCurrentRoles():
    AuthRoleName[] {
    return this.authStorage
      .getRoles();
  }

  isSessionChecked(): boolean {
    return this.sessionCheckedSubject
      .value;
  }

  // =========================================================
  // Estado de autenticación
  // =========================================================

  isAuthenticated(): boolean {
    const accessToken =
      this.getAccessToken();

    if (
      !accessToken
      || !this.hasValidJwtStructure(
        accessToken,
      )
    ) {
      return false;
    }

    return !this.isTokenExpired(
      accessToken,
    );
  }

  /*
   * Angular no puede leer directamente la cookie HttpOnly.
   * Solo comprobamos que exista información local con la que
   * intentar restaurar la sesión.
   */
  canRefreshSession(): boolean {
    return this.authStorage
      .hasSessionHint();
  }

  // =========================================================
  // Roles
  // =========================================================

  hasRole(
    requiredRole:
      AuthRoleName,
  ): boolean {
    return this.getCurrentRoles()
      .includes(
        requiredRole,
      );
  }

  hasAnyRole(
    requiredRoles:
      readonly AuthRoleName[],
  ): boolean {
    const currentRoles =
      this.getCurrentRoles();

    return requiredRoles.some(
      (role) =>
        currentRoles.includes(
          role,
        ),
    );
  }

  hasAllRoles(
    requiredRoles:
      readonly AuthRoleName[],
  ): boolean {
    const currentRoles =
      this.getCurrentRoles();

    return requiredRoles.every(
      (role) =>
        currentRoles.includes(
          role,
        ),
    );
  }
}
