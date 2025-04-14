import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UsuarioResponse, UsuarioListResponse, UsuarioCreateRequest} from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly API_BASE = 'http://localhost:8084/v1/sipe/usuarios';

  constructor(private http: HttpClient) {
  }

  getUsuarioPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.API_BASE}/${id}`);
  }

  getTodosUsuarios(): Observable<UsuarioListResponse> {
    return this.http.get<UsuarioListResponse>(this.API_BASE);
  }

  // getUsuarios(page = 0, size = 5): Observable<UsuarioListResponse> {
  //   return this.http.get<UsuarioListResponse>(`${this.API_BASE}?page=${page}&size=${size}`);
  // }


  getUsuarios(page = 0, size = 5, nome: string = ''): Observable<UsuarioListResponse> {
    let uri = `${this.API_BASE}?page=${page}&size=${size}${(nome === undefined || nome === '') ? '' : `&nome=${nome}`}`;
    console.log(uri);
    return this.http.get<UsuarioListResponse>(uri);
  }

  criarUsuario(usuario: UsuarioCreateRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.API_BASE, usuario);
  }

}
