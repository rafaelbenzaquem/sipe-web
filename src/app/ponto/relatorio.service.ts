import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment as env} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {

  private baseUrl = env.SIPE_API_URL + '/v1/sipe/relatorios';

  constructor(private http: HttpClient) {
  }

  async downloadRelatorioUsuario(matricula: string, inicio: Date, fim: Date): Promise<void> {
    const inicioFormatado = this.formatarData(inicio);
    const fimFormatado = this.formatarData(fim);
    const url = `${this.baseUrl}/${matricula.toUpperCase()}?inicio=${inicioFormatado}&fim=${fimFormatado}`;

    try {
      const response: HttpResponse<Blob> = await firstValueFrom(
        this.http.get(url, {
          observe: 'response',
          responseType: 'blob',
        })
      );

      const blob = response.body!;
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = matricula + '.pdf';

      if (contentDisposition && contentDisposition.includes('filename=')) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      this.saveBlob(blob, filename);

    } catch (error) {
      console.error('Ocorreu um erro durante o download:', error);
      throw error;
    }
  }

  private formatarData(date: Date): string {
    const dia = ('0' + date.getDate()).slice(-2);
    const mes = ('0' + (date.getMonth() + 1)).slice(-2);
    const ano = date.getFullYear();
    return `${dia}${mes}${ano}`;
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
