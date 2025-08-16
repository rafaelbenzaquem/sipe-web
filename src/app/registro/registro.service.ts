import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Registro, RegistroListResponse, RegistroResponse} from './registro.model';
import {environment as env} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private readonly API_BASE = env.SIPE_API_URL + '/v1/sipe/registros';

  constructor(private http: HttpClient) {
  }

  cria(registro: Registro, matricula: string, dia: string, idPedidoAlteracao: number): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.API_BASE}/pontos?matricula=${matricula}&dia=${dia}&id_pedido_alteracao=${idPedidoAlteracao}`,
      [registro.toNovoRequest()]);
  }

  atualiza(registro: Registro, matricula: string, dia: string, idPedidoAlteracao: number): Observable<RegistroResponse> {
    return this.http.put<RegistroResponse>(`${this.API_BASE}/pontos?matricula=${matricula}&dia=${dia}&id_pedido_alteracao=${idPedidoAlteracao}`,
      registro.toAtualizadoRequest());
  }


  aprova(id_registro: number, idPedidoAlteracao: number): Observable<RegistroResponse> {
    return this.http.put<RegistroResponse>(`${this.API_BASE}/${id_registro}`, null);
  }

  busca(id: number): Observable<RegistroResponse> {
    return this.http.get<RegistroResponse>(`${this.API_BASE}/${id}`);
  }

  listaAtuais(matricula: string, dia: string): Observable<RegistroListResponse> {
    return this.http.get<RegistroListResponse>(`${this.API_BASE}/pontos?matricula=${matricula}&dia=${dia}&todos=false`);
  }

  listaTodos(matricula: string, dia: string): Observable<RegistroListResponse> {
    return this.http.get<RegistroListResponse>(`${this.API_BASE}/pontos?matricula=${matricula}&dia=${dia}&todos=true`);
  }

  apaga(id: number, idPedidoAlteracao: number): Observable<RegistroResponse> {
    return this.http.delete<RegistroResponse>(`${this.API_BASE}/${id}?id_pedido_alteracao=${idPedidoAlteracao}`);
  }

}
