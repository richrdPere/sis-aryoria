import { ApiResponse } from 'src/app/core/interfaces/api-response.model';
import { AuthDeviceType } from '../login/login-request.model';
import { AuthUser } from '../login/login-response.model';

// ==========================================================
// Expiración
// ==========================================================
export interface RefreshTokenExpiration {
  access_token: number;
  refresh_token: number;
}

// ==========================================================
// Sesión renovada
// ==========================================================

export interface RefreshTokenSession {
  id_refresh_token: number;

  dispositivo_id: string | null;

  tipo_dispositivo: AuthDeviceType;

  /*
   * El response actual de refresh no devuelve este campo,
   * pero login o registro sí podrían devolverlo.
   */
  nombre_dispositivo?: string | null;

  fecha_expiracion: string;
}

// ==========================================================
// Data
// ==========================================================

export interface RefreshTokenData {
  access_token: string;

  /*
   * En Android/iOS se devuelve en el JSON.
   * En Angular Web se guarda en una cookie HttpOnly.
   */
  refresh_token?: string;
  expires_in: RefreshTokenExpiration;
  sesion: RefreshTokenSession;
  usuario: AuthUser;
}

// ==========================================================
// Response
// ==========================================================

export type RefreshTokenResponse =
  ApiResponse<RefreshTokenData>;
