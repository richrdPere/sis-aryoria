import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

// Environment

import {
  environment,
} from '@environments/environment';

// Services

import {
  AuthStorageService,
  StoredSession,
  TokenExpiration,
} from 'src/app/core/auth/auth-storage.service';

// Helpers

import {
  HttpServiceHelper,
} from 'src/app/core/auth/http-service.helper';

// Interfaces

import {
  AuthJwtPayload,
  AuthUser,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  // RegisterRequest,
  // RegisterResponse,
} from './interfaces/';

// =========================================================
// Respuesta de perfil
// =========================================================

export interface GetMeResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

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

  private readonly API_BASE = `${environment.main_url}auth`;

  private readonly API_LOGIN = `${this.API_BASE}/login`;
  private readonly API_REGISTER = `${this.API_BASE}/register`;
  private readonly API_LOGOUT = `${this.API_BASE}/logout`;
  private readonly API_LOGOUT_ALL = `${this.API_BASE}/logout-all`;
  private readonly API_REFRESH = `${this.API_BASE}/refresh-token`;
  private readonly API_ME = `${this.API_BASE}/me`;
  private readonly API_CHANGE_PASSWORD = `${this.API_BASE}/change-password`;

  // =========================================================
  // Estado de autenticación
  // =========================================================
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(
    null,
  );

  readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly sessionCheckedSubject = new BehaviorSubject<boolean>(
    false,
  );

  readonly sessionChecked$ = this.sessionCheckedSubject
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
    const deviceId = this.authStorage.getOrCreateDeviceId();

    const payload: LoginRequest = {
      ...request,

      dispositivo_id: deviceId,
      tipo_dispositivo: 'WEB',
      nombre_dispositivo: request.nombre_dispositivo || this.getBrowserName(),
    };

    return this.http.post<LoginResponse>(
      this.API_LOGIN,
      payload,
      {
        headers: this.getJsonHeaders(),

        /*
         * Necesario para recibir la cookie HttpOnly
         * enviada por el backend.
         */
        withCredentials: true,
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
  register(request: RegisterRequest): Observable<RegisterResponse> {
    const deviceId =
      this.authStorage
        .getOrCreateDeviceId();

    const payload: RegisterRequest = {
      ...request,

      dispositivo_id: deviceId,
      tipo_dispositivo: 'WEB',
      nombre_dispositivo: request.nombre_dispositivo || this.getBrowserName(),
    };

    return this.http.post<RegisterResponse>(
      this.API_REGISTER,
      payload,
      {
        headers: this.getJsonHeaders(),
        withCredentials: true,
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
  // 3. Logout
  // =========================================================

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(
      this.API_LOGOUT,
      {},
      {
        headers:
          this.getJsonHeaders(),

        withCredentials: true,
      },
    ).pipe(
      catchError((error) =>
        HttpServiceHelper.handleError(
          error,
          'No se pudo cerrar la sesión en el servidor.',
        ),
      ),

      /*
       * La información local debe eliminarse incluso si el
       * backend no se encuentra disponible.
       */
      finalize(() => {
        this.closeLocalSession();
      }),
    );
  }

  // =========================================================
  // 4. Cerrar todas las sesiones
  // =========================================================

  logoutAll(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(
      this.API_LOGOUT_ALL,
      {},
      {
        headers:
          this.getJsonHeaders(),

        withCredentials: true,
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
  // 5. Renovar sesión
  // =========================================================

  refreshToken():
    Observable<RefreshTokenResponse> {
    const deviceId =
      this.authStorage
        .getOrCreateDeviceId();

    return this.http
      .post<RefreshTokenResponse>(
        this.API_REFRESH,
        {
          dispositivo_id:
            deviceId,

          tipo_dispositivo:
            'WEB',

          nombre_dispositivo:
            this.getBrowserName(),
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
                  this.getBrowserName(),
              },
            }),

          /*
           * El navegador enviará automáticamente:
           *
           * aryoria_refresh_token
           */
          withCredentials: true,
        },
      )
      .pipe(
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
  // 6. Obtener usuario autenticado
  // =========================================================

  getMe(): Observable<GetMeResponse> {
    return this.http
      .get<GetMeResponse>(
        this.API_ME,
        {
          headers:
            this.getJsonHeaders(),

          withCredentials: true,
        },
      )
      .pipe(
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

        withCredentials: true,
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

    /*
     * Si hay un access token vigente, restauramos
     * inmediatamente el usuario guardado.
     */
    if (
      accessToken
      && savedUser
      && this.hasValidJwtStructure(
        accessToken,
      )
      && !this.isTokenExpired(
        accessToken,
      )
    ) {
      this.currentUserSubject.next(
        savedUser,
      );

      return of(savedUser);
    }

    /*
     * Si existe información local de una sesión anterior,
     * intentamos renovarla mediante la cookie HttpOnly.
     *
     * Angular no necesita ni puede leer el refresh token.
     */
    if (
      savedUser
      || this.authStorage.getSession()
    ) {
      return this.refreshToken().pipe(
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
          this.sessionCheckedSubject.next(
            true,
          );
        }),
      )
      .subscribe({
        error: () => {
          this.closeLocalSession();

          this.sessionCheckedSubject.next(
            true,
          );
        },
      });
  }

  // =========================================================
  // Procesar respuesta de autenticación
  // =========================================================

  private processAuthResponse(
    response:
      | LoginResponse
      | RegisterResponse
      | RefreshTokenResponse,
  ): void {
    const {
      access_token,
      expires_in,
      sesion,
      usuario,
    } = response.data;

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

    const roles =
      this.normalizeRoles(
        usuario.roles,
      );

    const storedSession: StoredSession = {
      sessionId: String(sesion.id_refresh_token),
      dispositivoId: sesion.dispositivo_id || this.authStorage.getOrCreateDeviceId(),
      tipoDispositivo: sesion.tipo_dispositivo || 'WEB',
      fechaExpiracion: sesion.fecha_expiracion,
    };

    const storedExpiration: TokenExpiration = {
      accessToken: expires_in.access_token,
      refreshToken: expires_in.refresh_token,
    };

    this.authStorage.saveLogin({
      accessToken: access_token,
      refreshToken: storedExpiration.refreshToken,
      expiresIn: storedExpiration,
      sesion: storedSession,
      roles,
      usuario,

    });

    this.currentUserSubject.next(
      usuario,
    );
  }

  // =========================================================
  // Headers
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
  // Roles
  // =========================================================

  private normalizeRoles(
    roles:
      | string[]
      | Array<{
        nombre: string;
      }>
      | null
      | undefined,
  ): string[] {
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles
      .map((role) => {
        if (typeof role === 'string') {
          return role;
        }

        return role?.nombre;
      })
      .filter(
        (
          role,
        ): role is string =>
          Boolean(role),
      );
  }

  // =========================================================
  // JWT
  // =========================================================

  private hasValidJwtStructure(
    token: string | null,
  ): token is string {
    if (!token) {
      return false;
    }

    const normalizedToken =
      token
        .replace(
          /^Bearer\s+/i,
          '',
        )
        .trim();

    if (
      normalizedToken === 'null'
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
        .isTokenExpired(
          token,
        );
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
      userAgent.includes('Chrome/')
    ) {
      return 'Google Chrome';
    }

    if (
      userAgent.includes('Firefox/')
    ) {
      return 'Mozilla Firefox';
    }

    if (
      userAgent.includes('Safari/')
    ) {
      return 'Safari';
    }

    return 'Navegador web';
  }

  // =========================================================
  // Cerrar sesión local
  // =========================================================

  closeLocalSession(): void {
    this.authStorage.clearSession();

    this.currentUserSubject.next(
      null,
    );
  }

  // =========================================================
  // Getters
  // =========================================================

  getAccessToken(): string | null {
    return this.authStorage
      .getAccessToken();
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  getCurrentUser():
    AuthUser | null {
    return this.currentUserSubject
      .value;
  }

  getCurrentRoles(): string[] {
    return this.authStorage
      .getRoles();
  }

  isSessionChecked(): boolean {
    return this.sessionCheckedSubject
      .value;
  }

  // =========================================================
  // Validar autenticación
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
   * Angular no puede verificar directamente la cookie
   * HttpOnly. Este método solo indica que existe información
   * local de una sesión que podría restaurarse.
   */
  canRefreshSession(): boolean {
    return Boolean(
      this.authStorage
        .getSession()
      || this.authStorage
        .getUser<AuthUser>(),
    );
  }

  // =========================================================
  // Roles
  // =========================================================

  hasRole(
    requiredRole: string,
  ): boolean {
    return this.getCurrentRoles()
      .includes(
        requiredRole,
      );
  }

  hasAnyRole(
    requiredRoles:
      readonly string[],
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
      readonly string[],
  ): boolean {
    const currentRoles = this.getCurrentRoles();

    return requiredRoles.every(
      (role) =>
        currentRoles.includes(
          role,
        ),
    );
  }
}
