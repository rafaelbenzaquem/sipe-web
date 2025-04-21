import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Se estiver usando Angular

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private baseUrl = 'http://localhost:8084/v1/sipe/relatorios';

  constructor(private http: HttpClient) {} // Se estiver usando Angular

  async downloadRelatorio(matricula: string, inicio: Date, fim: Date): Promise<void> {
    const inicioFormatado = this.formatarData(inicio); // Implemente sua função de formatação
    const fimFormatado = this.formatarData(fim);     // Implemente sua função de formatação
    const url = `${this.baseUrl}/${matricula.toUpperCase()}?inicio=${inicioFormatado}&fim=${fimFormatado}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Erro ao baixar relatório: ${response.status} - ${errorBody}`);
        throw new Error(`Erro ao baixar relatório: ${response.status}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = matricula + '.pdf'; // Valor padrão

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
