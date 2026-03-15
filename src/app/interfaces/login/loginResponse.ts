import { Usuario } from "./usuarioResponse";

export interface LoginResponse {
  message: string;
  token: string;
  usuario: Usuario;
}
