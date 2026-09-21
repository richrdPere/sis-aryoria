import { ApiResponse } from "src/app/core/interfaces/api-response.model";
import { AuthPerson, AuthTokenExpiration, AuthUser } from "../login/login-response.model";
import { AuthDeviceType } from "../login/login-request.model";

// ==========================================================
// Persona
// ==========================================================

export interface RegisterPersonRequest {
  nombres: string;
  apellidos: string;
  numero_documento: string;
  email?: string | null;
  telefono?: string | null;

  tipo_documento?: string | null;
  fecha_nacimiento?: string | null;
  foto_url?: string | null;
  genero?: string | null;
  direccion?: string | null;
}

// ==========================================================
// Usuario
// ==========================================================

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

// ==========================================================
// Registro
// ==========================================================

export interface RegisterRequest {
  persona: RegisterPersonRequest;
  usuario: RegisterUserRequest;

  /*
   * Son opcionales porque AuthService los completa
   * automáticamente antes de enviar la petición.
   */
  dispositivo_id?: string;
  tipo_dispositivo?: AuthDeviceType;
  nombre_dispositivo?: string;
}

// ==========================================================
// Sesión creada por el backend
// ==========================================================

export interface AuthSessionData {
  id_refresh_token: number;
  dispositivo_id: string | null;
  tipo_dispositivo: AuthDeviceType;
  nombre_dispositivo: string | null;
  fecha_expiracion: string;
}


export type AryoriaRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EMPLEADO'
  | 'CONTADOR'
  | 'USUARIO';

// ==========================================================
// Data del registro
// ==========================================================

export interface RegisterData {
  access_token: string;

  /*
   * ANDROID/IOS:
   * El backend lo devuelve en el JSON.
   *
   * WEB:
   * El backend lo guarda en una cookie HttpOnly
   * y no lo devuelve en el JSON.
   */
  refresh_token?: string;

  expires_in: AuthTokenExpiration;

  sesion: AuthSessionData;

  usuario: AuthUser;
}

// ==========================================================
// Response
// ==========================================================

export type RegisterResponse = ApiResponse<RegisterData>;
