import { ApiResponse } from "src/app/core/interfaces/api-response.model";
import { AuthPerson, AuthUser } from "../login/login-response.model";

export type AuthDeviceType =
  | 'WEB'
  | 'ANDROID'
  | 'IOS'
  | 'OTRO';

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
// Expiración de tokens
// ==========================================================

export interface AuthTokenExpiration {
  access_token: number;
  refresh_token: number;
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


// export interface AuthPerson {
//   id_persona: number;
//   nombres: string;
//   apellidos: string;

//   documento_identidad:
//   string | null;

//   tipo_documento:
//   string | null;

//   fecha_nacimiento:
//   string | null;

//   telefono:
//   string | null;

//   foto_url:
//   string | null;

//   genero:
//   string | null;

//   direccion:
//   string | null;
// }

export type AryoriaRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EMPLEADO'
  | 'CONTADOR'
  | 'USUARIO';

// export interface AuthUser {
//   id_usuario: number;
//   id_persona: number;
//   email: string;
//   username: string;
//   estado: boolean;

//   ultimo_acceso: string | null;

//   persona: AuthPerson | null;

//   roles: AryoriaRole[];
// }

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

// export interface RegisterResponse {
//   success: boolean;
//   message: string;
//   data: RegisterData;
// }

export type RegisterResponse = ApiResponse<RegisterData>;
