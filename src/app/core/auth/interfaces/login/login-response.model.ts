import { ApiResponse } from 'src/app/core/interfaces/api-response.model';
import { AuthDeviceType } from './login-request.model';

// ==========================================================
// Roles
// ==========================================================

export type AuthRoleName =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EMPLEADO'
  | 'CONTADOR'
  | 'USUARIO';

export interface AuthRole {
  id_rol: number;
  nombre: AuthRoleName;
  descripcion: string | null;
}

// ==========================================================
// Persona autenticada
// ==========================================================

export interface AuthPerson {
  id_persona: number;
  nombres: string;
  apellidos: string;

  documento_identidad: string | null;

  tipo_documento: string | null;

  fecha_nacimiento: string | null;

  telefono: string | null;

  foto_url: string | null;

  genero: string | null;

  direccion: string | null;
}

// ==========================================================
// Usuario autenticado
// ==========================================================

export interface AuthUser {
  id_usuario: number;
  id_persona: number;
  email: string;
  username: string;
  estado: boolean;

  ultimo_acceso: string | null;
  persona: AuthPerson | null;
  roles: AuthRoleName[];
}

// ==========================================================
// Expiración
// ==========================================================

export interface AuthTokenExpiration {
  access_token: number;
  refresh_token: number;
}

// ==========================================================
// Sesión
// ==========================================================

export interface AuthSession {
  id_refresh_token: number;

  dispositivo_id: string | null;

  tipo_dispositivo: AuthDeviceType;

  nombre_dispositivo: string | null;

  fecha_expiracion: string;
}

// ==========================================================
// Data común de autenticación
// ==========================================================

export interface AuthResponseData {
  access_token: string;

  /*
   * En Android/iOS viene en el JSON.
   * En web se almacena en una cookie HttpOnly.
   */
  refresh_token?: string;

  expires_in: AuthTokenExpiration;

  sesion: AuthSession;

  usuario: AuthUser;
}

// ==========================================================
// Respuesta común
// ==========================================================

export type LoginResponse = ApiResponse<AuthResponseData>;

// Login, registro y refresh utilizan el mismo contrato.

// export type LoginData = AuthResponseData;

// export type RegisterData = AuthResponseData;

// export type RefreshTokenData = AuthResponseData;

// export type LoginResponse = AuthResponse;

// export type RegisterResponse = AuthResponse;

// export type RefreshTokenResponse = AuthResponse;
