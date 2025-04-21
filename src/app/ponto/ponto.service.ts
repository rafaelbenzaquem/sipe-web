import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PontoListResponse, PontoResponse} from './ponto.model';

@Injectable({
  providedIn: 'root'
})
export class PontoService {

  private readonly API_BASE = 'http://localhost:8084/v1/sipe/pontos';

  constructor(private http: HttpClient) {
  }

  getPonto(matricula: string, dia: string): Observable<PontoResponse> {
    return this.http.get<PontoResponse>(`${this.API_BASE}/${matricula}/${dia}`);
  }

  getPontosUsuario(matricula: string, inicio: string, fim: string): Observable<PontoListResponse> {
    return this.http.get<PontoListResponse>(`${this.API_BASE}?matricula=${matricula}&inicio=${inicio}&fim=${fim}`);
  }

  atualizaPontosUsuario(matricula: string, inicio: string, fim: string): Observable<PontoListResponse> {
    return this.http.post<PontoListResponse>(`${this.API_BASE}/usuarios?matricula=${matricula}&inicio=${inicio}&fim=${fim}`, null);
  }

}
