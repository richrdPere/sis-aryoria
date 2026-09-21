import { Injectable } from '@angular/core';
import { AuthDeviceType, AuthRoleName } from './interfaces';

// ==========================================================
// Expiración almacenada
// ==========================================================
export interface TokenExpiration {
  accessToken: number;
  refreshToken: number;
}

// ==========================================================
// Sesión almacenada
// ==========================================================
export interface StoredSession {
  sessionId: string;
  dispositivoId: string;
  tipoDispositivo: AuthDeviceType;
  fechaExpiracion: string;
}

// ==========================================================
// Datos almacenados después de autenticarse
// ==========================================================
export interface StoredLoginData<
  TUsuario = unknown
> {
  accessToken: string;
  expiresIn: TokenExpiration;
  sesion: StoredSession;
  roles: AuthRoleName[];
  usuario: TUsuario;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {

  // ========================================================
  // Claves de Aryoria
  // ========================================================
  private readonly keys = {
    accessToken: 'aryoria_web_access_token',
    expiresIn: 'aryoria_web_expires_in',
    deviceId: 'aryoria_web_device_id',
    roles: 'aryoria_web_roles',
    sesion: 'aryoria_web_sesion',
    usuario: 'aryoria_web_usuario',
  } as const;

  /*
   * Claves anteriores que ya no deben utilizarse.
   */
  private readonly legacyKeys = {
    refreshToken: 'refreshToken',
    recoleccionDeviceId: 'recoleccion_web_device_id',
  } as const;

  constructor() {
    this.removeLegacyRefreshToken();
  }

  // ========================================================
  // 1. Access token
  // ========================================================

  getAccessToken(): string | null {
    return this.readString(
      this.keys.accessToken,
    );
  }

  // ========================================================
  // 2. Roles
  // ========================================================

  getRoles(): AuthRoleName[] {
    const roles = this.readJson<unknown>(this.keys.roles);

    if (!Array.isArray(roles)) {
      return [];
    }

    const validRoles:
      AuthRoleName[] = [
        'SUPER_ADMIN',
        'ADMIN',
        'EMPLEADO',
        'CONTADOR',
        'USUARIO',
      ];

    return roles.filter(
      (
        role,
      ): role is AuthRoleName =>
        typeof role === 'string'
        && validRoles.includes(
          role as AuthRoleName,
        ),
    );
  }

  // ========================================================
  // 3. Sesión
  // ========================================================
  getSession(): StoredSession | null {
    return this.readJson<StoredSession>(
      this.keys.sesion,
    );
  }

  // ========================================================
  // 4. Usuario
  // ========================================================
  getUser<TUsuario>(): TUsuario | null {
    return this.readJson<TUsuario>(
      this.keys.usuario,
    );
  }

  // ========================================================
  // 5. Expiración
  // ========================================================
  getExpiresIn(): TokenExpiration | null {
    return this.readJson<TokenExpiration>(
      this.keys.expiresIn,
    );
  }

  // ========================================================
  // 6. Guardar autenticación
  // ========================================================

  saveLogin<TUsuario>(
    data: StoredLoginData<TUsuario>,
  ): void {
    this.writeString(
      this.keys.accessToken,
      data.accessToken,
    );

    this.writeJson(
      this.keys.expiresIn,
      data.expiresIn,
    );

    this.writeJson(
      this.keys.roles,
      data.roles,
    );

    this.writeJson(
      this.keys.sesion,
      data.sesion,
    );

    this.writeJson(
      this.keys.usuario,
      data.usuario,
    );

    /*
     * Garantizar que no quede un refresh token antiguo
     * expuesto en localStorage.
     */
    this.removeLegacyRefreshToken();
  }

  // ========================================================
  // 7. Obtener o crear ID del navegador
  // ========================================================
  getOrCreateDeviceId(): string {
    const storedDeviceId = this.readString(this.keys.deviceId);

    if (storedDeviceId) {
      return storedDeviceId;
    }

    const uuid = typeof crypto !== 'undefined'
      && typeof crypto.randomUUID
      === 'function'
      ? crypto.randomUUID()
      : this.createFallbackUuid();

    const deviceId = `web-${uuid}`;

    this.writeString(
      this.keys.deviceId,
      deviceId,
    );

    return deviceId;
  }

  // ========================================================
  // 8. Verificar información local de sesión
  // ========================================================
  hasSession(): boolean {
    return Boolean(
      this.getAccessToken()
      && this.getUser()
      && this.getSession(),
    );
  }

  /*
   * Indica que existe información local con la que se puede
   * intentar restaurar la sesión mediante la cookie HttpOnly.
   *
   * No garantiza que la cookie siga vigente.
   */
  hasSessionHint(): boolean {
    return Boolean(
      this.getUser()
      || this.getSession(),
    );
  }

  // ========================================================
  // 9. Limpiar sesión local
  // ========================================================
  clearSession(): void {
    /*
     * No se eliminan:
     *
     * - aryoria_web_device_id
     * - aryoria_web_theme
     *
     * El navegador conserva identidad y preferencias.
     */

    this.removeItem(
      this.keys.accessToken,
    );

    this.removeItem(
      this.keys.expiresIn,
    );

    this.removeItem(
      this.keys.roles,
    );

    this.removeItem(
      this.keys.sesion,
    );

    this.removeItem(
      this.keys.usuario,
    );

    this.removeLegacyRefreshToken();
  }

  // ========================================================
  // 10. Guardar token renovado
  // ========================================================
  saveTokens(accessToken: string, expiresIn: TokenExpiration): void {
    this.writeString(
      this.keys.accessToken,
      accessToken,
    );

    this.writeJson(
      this.keys.expiresIn,
      expiresIn,
    );

    this.removeLegacyRefreshToken();
  }

  // ========================================================
  // 11. Actualizar usuario
  // ========================================================
  saveUser<TUsuario>(usuario: TUsuario, roles: AuthRoleName[]): void {
    this.writeJson(
      this.keys.usuario,
      usuario,
    );

    this.writeJson(
      this.keys.roles,
      roles,
    );
  }

  // ========================================================
  // 12. Guardar sesión
  // ========================================================

  saveSession(
    session: StoredSession,
  ): void {
    this.writeJson(
      this.keys.sesion,
      session,
    );
  }

  // ========================================================
  // Métodos privados
  // ========================================================

  private getStorage():
    Storage | null {
    if (
      typeof window === 'undefined'
      || !window.localStorage
    ) {
      return null;
    }

    return window.localStorage;
  }

  private readString(
    key: string,
  ): string | null {
    const storage =
      this.getStorage();

    if (!storage) {
      return null;
    }

    const value =
      storage.getItem(key);

    const normalizedValue =
      value?.trim();

    if (
      !normalizedValue
      || normalizedValue === 'null'
      || normalizedValue === 'undefined'
    ) {
      return null;
    }

    return normalizedValue;
  }

  private readJson<T>(
    key: string,
  ): T | null {
    const storage =
      this.getStorage();

    if (!storage) {
      return null;
    }

    const value =
      storage.getItem(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      storage.removeItem(key);

      return null;
    }
  }

  private writeString(
    key: string,
    value: string,
  ): void {
    const storage =
      this.getStorage();

    if (!storage) {
      return;
    }

    const normalizedValue =
      value.trim();

    if (!normalizedValue) {
      storage.removeItem(key);

      return;
    }

    storage.setItem(
      key,
      normalizedValue,
    );
  }

  private writeJson(
    key: string,
    value: unknown,
  ): void {
    const storage =
      this.getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(
      key,
      JSON.stringify(value),
    );
  }

  private removeItem(
    key: string,
  ): void {
    this.getStorage()
      ?.removeItem(key);
  }

  private removeLegacyRefreshToken():
    void {
    const storage =
      this.getStorage();

    if (!storage) {
      return;
    }

    /*
     * El refresh token de Aryoria Web vive únicamente en una
     * cookie HttpOnly administrada por el backend.
     */
    storage.removeItem(
      this.legacyKeys.refreshToken,
    );
  }

  private createFallbackUuid():
    string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(
        /[xy]/g,
        (character) => {
          const randomValue =
            Math.floor(
              Math.random() * 16,
            );

          const value =
            character === 'x'
              ? randomValue
              : (
                randomValue & 0x3
              ) | 0x8;

          return value.toString(16);
        },
      );
  }
}
