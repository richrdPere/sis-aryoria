

export interface Usuario {

  id: number;
  nombre: string;
  apellidos: string;
  username: string;
  telefono?: string;
  documento_identidad: string;
  email: string;
  direccion?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  rol: UsuarioRol;
  estado: boolean;
  foto_perfil?: string | null;
  createdAt: string;
  updatedAt: string;

}

export enum UsuarioRol {
  SERENO = "SERENO",
  SUPERVISOR_SERENAZGO = "SUPERVISOR_SERENAZGO",
  GERENTE_SERENAZGO = "GERENTE_SERENAZGO",
  OPERADOR = "OPERADOR",
  CONDUCTOR = "CONDUCTOR"

}


export interface UsuarioResponse {
  data: Usuario[];
  total: number;
  page: number;
  limit: number;
}
