import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UsuarioResponse, UsuarioListResponse, UsuarioCreateRequest, UsuarioUpdateRequest} from './usuario.model';
import {environment as env} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly API_BASE = env.SIPE_API_URL + '/v1/sipe/usuarios';

  constructor(private http: HttpClient) {
  }

  buscarPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.API_BASE}/${id}`);
  }

  buscarPorMatricula(matricula: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.API_BASE}/${matricula}`);
  }

  listar(nome = '', matricula = '', cracha =''): Observable<UsuarioListResponse> {
    const params: string[] = [];
    if (nome !== undefined && nome !== '') params.push(`nome=${encodeURIComponent(nome)}`);
    if (matricula !== undefined && matricula !== '') params.push(`matricula=${encodeURIComponent(matricula)}`);
    if (cracha !== undefined && cracha !== '') params.push(`cracha=${encodeURIComponent(cracha)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    const uri = `${this.API_BASE}${query}`;
    console.log("Listar: "+uri);
    return this.http.get<UsuarioListResponse>(uri);
  }


  paginar(page = 0, size = 5, nome = '', matricula = '', cracha =''): Observable<UsuarioListResponse> {
    let uri = `${this.API_BASE}/pag?page=${page}&size=${size}${(nome === undefined || nome === '') ? `` : `&nome=${nome}`}${(matricula === undefined || matricula === '') ? `` : `&matricula=${matricula}`}${(cracha === undefined || cracha === '') ? `` : `&cracha=${cracha}`}`;
    console.log("Paginar: "+uri);
    return this.http.get<UsuarioListResponse>(uri);
  }

  criar(usuario: UsuarioCreateRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.API_BASE, usuario);
  }

  atualizar(usuario: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.API_BASE}/${usuario.id}`, usuario);
  }

}
