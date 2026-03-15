import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '../../environments/environment';

// Interfaces
import { Usuario, UsuarioResponse } from '../interfaces/login/usuarioResponse';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  envs = environment;

  API_BASE = this.envs.main_url + 'usuarios';

  constructor(private http: HttpClient) { }

  // =========================================================
  // 1. Listar usuarios (paginado + buscador)
  // =========================================================
  getUsuariosPaginados(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    rol?: string,
    estado?: boolean
  ): Observable<UsuarioResponse> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    if (rol) params = params.set('rol', rol);
    if (estado !== undefined) params = params.set('estado', estado);

    return this.http.get<UsuarioResponse>(this.API_BASE, { params });
  }

  // =========================================================
  // 2. Obtener usuario por ID
  // =========================================================
  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_BASE}/${id}`);
  }

  // =========================================================
  // 3. Crear usuario
  // =========================================================
  crearUsuario(data: any): Observable<any> {

    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post(
      this.API_BASE,
      data,
      { headers }
    );
  }

  // =========================================================
  // 4. Actualizar usuario
  // =========================================================
  actualizarUsuario(id: number, data: any): Observable<any> {

    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.put(
      `${this.API_BASE}/${id}`,
      data,
      { headers }
    );
  }

  // =========================================================
  // 5. Eliminar usuario
  // =========================================================
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/${id}`);
  }

  // =========================================================
  // 6. Cambiar estado usuario
  // =========================================================
  cambiarEstado(id: number, estado: boolean): Observable<any> {

    return this.http.patch(
      `${this.API_BASE}/${id}/estado`,
      { estado }
    );

  }

}
