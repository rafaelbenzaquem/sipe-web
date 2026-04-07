import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AuthService} from '../../auth/auth.service';
import {UsuarioService} from '../../usuario/usuario.service';
import {PontoService} from '../../ponto/ponto.service';
import {Usuario} from '../../usuario/usuario.model';
import {Ponto} from '../../ponto/ponto.model';
import {forkJoin, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export interface LinhaTabela {
  usuario: Usuario;
  ponto: Ponto | null;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-tabela',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard-tabela.component.html',
  styleUrl: './dashboard-tabela.component.scss'
})
export class DashboardTabelaComponent implements OnInit {

  linhas: LinhaTabela[] = [];
  carregando = true;
  readonly colunas = ['nome', 'matricula', 'horasTrabalhadas', 'horasRestantes', 'progresso', 'status'];

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private pontoService: PontoService
  ) {}

  ngOnInit(): void {
    const hoje = this.formatarDataApi(new Date());
    const matricula = this.authService.getUsuario()?.matricula ?? '';

    const usuarios$ = this.authService.hasRole('GRP_SIPE_DIRETOR')
      ? this.usuarioService.listarPorDiretor(matricula)
      : this.usuarioService.listar();

    usuarios$.subscribe({
      next: (response) => {
        const usuarios = (response._embedded?.usuarios ?? []).map(u => Usuario.toModel(u));

        if (usuarios.length === 0) {
          this.carregando = false;
          return;
        }

        // Busca o ponto de hoje para cada usuário em paralelo
        const pontoRequests = usuarios.map(u =>
          this.pontoService.getPonto(u.matricula!, hoje).pipe(
            map(p => Ponto.toModel(p)),
            catchError(() => of(null))
          )
        );

        forkJoin(pontoRequests).subscribe({
          next: (pontos) => {
            this.linhas = usuarios.map((u, i) => ({usuario: u, ponto: pontos[i]}));
            this.carregando = false;
          },
          error: () => {
            this.carregando = false;
          }
        });
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  get titulo(): string {
    return this.authService.hasRole('GRP_SIPE_DIRETOR')
      ? 'Ponto do Setor — Hoje'
      : 'Ponto Geral — Hoje';
  }

  horasTrabalhadas(linha: LinhaTabela): string {
    return linha.ponto ? this.formatarSegundos(linha.ponto.total_segundos) : '---';
  }

  horasRestantes(linha: LinhaTabela): string {
    if (!linha.usuario.hora_diaria || !linha.ponto) return '---';
    const restantes = (linha.usuario.hora_diaria * 3600) - linha.ponto.total_segundos;
    return restantes > 0 ? this.formatarSegundos(restantes) : '00:00:00';
  }

  progresso(linha: LinhaTabela): number {
    if (!linha.usuario.hora_diaria || !linha.ponto) return 0;
    return Math.min(100, Math.round((linha.ponto.total_segundos / (linha.usuario.hora_diaria * 3600)) * 100));
  }

  corProgresso(linha: LinhaTabela): 'primary' | 'accent' | 'warn' {
    const p = this.progresso(linha);
    if (p >= 100) return 'primary';
    if (p >= 75) return 'accent';
    return 'warn';
  }

  temPonto(linha: LinhaTabela): boolean {
    return linha.ponto !== null;
  }

  private formatarDataApi(date: Date): string {
    const dia = ('0' + date.getDate()).slice(-2);
    const mes = ('0' + (date.getMonth() + 1)).slice(-2);
    const ano = date.getFullYear();
    return `${dia}${mes}${ano}`;
  }

  private formatarSegundos(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
  }
}
