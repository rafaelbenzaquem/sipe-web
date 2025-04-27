import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RegistroListResponse, RegistroResponse} from './registro.model';
import {environment as env} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private readonly API_BASE = env.SIPE_API_URL + '/v1/sipe';

  constructor(private http: HttpClient) {
  }

  getRegistro(id: number): Observable<RegistroResponse> {
    return this.http.get<RegistroResponse>(`${this.API_BASE}/pontos/registros/${id}`);
  }

  getRegistros(matricula: string, dia: string): Observable<RegistroListResponse> {
    return this.http.get<RegistroListResponse>(`${this.API_BASE}/registros/pontos?matricula=${matricula}&dia=${dia}`);
  }

}
