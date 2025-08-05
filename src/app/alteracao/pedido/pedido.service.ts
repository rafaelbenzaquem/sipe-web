import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PedidoNovoRequest, PedidoResponse} from './pedido.model';
import {environment as env} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly API_BASE = env.SIPE_API_URL + '/v1/sipe/pedido/alteracao';

  constructor(private http: HttpClient) {
  }

  realizarPedido(matriculaPonto: string, diaPonto: string, justificativa: string): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.API_BASE}`,
      new PedidoNovoRequest(matriculaPonto, diaPonto, justificativa));
  }

  apagar(id: number): Observable<PedidoResponse> {
    return this.http.delete<PedidoResponse>(`${this.API_BASE}/${id}`);
  }

  obter(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.API_BASE}/${id}`);
  }

  obterPorPonto(matricula: string, dia: string): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.API_BASE}/${matricula}/${dia}/pontos`);
  }

}
