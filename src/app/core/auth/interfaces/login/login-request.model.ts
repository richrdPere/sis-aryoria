/*
|--------------------------------------------------------------------------
| Tipos de dispositivo permitidos
|--------------------------------------------------------------------------
*/

export type AuthDeviceType =
  | 'WEB'
  | 'ANDROID'
  | 'IOS'
  | 'OTRO';

/*
|--------------------------------------------------------------------------
| Login request
|--------------------------------------------------------------------------
|
| El formulario solo necesita enviar username y password.
| AuthService completa los datos del dispositivo.
|
*/

export interface LoginRequest {
  username: string;
  password: string;

  dispositivo_id?: string;
  tipo_dispositivo?: AuthDeviceType;
  nombre_dispositivo?: string;
}
