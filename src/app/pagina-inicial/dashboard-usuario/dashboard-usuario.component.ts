import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {AuthService} from '../../auth/auth.service';
import {PontoService} from '../../ponto/ponto.service';
import {RegistroService} from '../../registro/registro.service';
import {Usuario} from '../../usuario/usuario.model';
import {Ponto} from '../../ponto/ponto.model';
import {Registro} from '../../registro/registro.model';
import {catchError, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-dashboard-usuario',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './dashboard-usuario.component.html',
  styleUrl: './dashboard-usuario.component.scss'
})
export class DashboardUsuarioComponent implements OnInit {

  usuario: Usuario | null = null;
  ponto: Ponto | null = null;
  registros: Registro[] = [];
  carregando = true;
  hojeExibicao = '';

  constructor(
    private authService: AuthService,
    private pontoService: PontoService,
    private registroService: RegistroService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    const hoje = new Date();
    this.hojeExibicao = hoje.toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const hojeApi = this.formatarDataApi(hoje);

    if (!this.usuario?.matricula) {
      this.carregando = false;
      return;
    }

    const matricula = this.usuario.matricula;

    this.pontoService.getPonto(matricula, hojeApi).pipe(
      switchMap(pontoResponse => {
        this.ponto = Ponto.toModel(pontoResponse);
        return this.registroService.listaAtuais(matricula, hojeApi);
      }),
      catchError(() => of(null))
    ).subscribe({
      next: (response) => {
        if (response?._embedded?.registros) {
          this.registros = response._embedded.registros.map(r => Registro.toModel(r));
        }
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  get primeiraEntrada(): string {
    const entradas = this.registros.filter(r => r.sentido === 'Entrada' && r.ativo);
    return entradas.length > 0 ? entradas[0].hora : '---';
  }

  get ultimaSaida(): string {
    const saidas = this.registros.filter(r => r.sentido === 'Saída' && r.ativo);
    return saidas.length > 0 ? saidas[saidas.length - 1].hora : '---';
  }

  get horasTrabalhadas(): string {
    return this.ponto ? this.formatarSegundos(this.ponto.total_segundos) : '00:00:00';
  }

  get horasRestantes(): string {
    if (!this.usuario?.hora_diaria) return '---';
    const restantes = (this.usuario.hora_diaria * 3600) - (this.ponto?.total_segundos ?? 0);
    return restantes > 0 ? this.formatarSegundos(restantes) : '00:00:00';
  }

  get progresso(): number {
    if (!this.usuario?.hora_diaria || !this.ponto) return 0;
    return Math.min(100, Math.round((this.ponto.total_segundos / (this.usuario.hora_diaria * 3600)) * 100));
  }

  get corProgresso(): 'primary' | 'accent' | 'warn' {
    if (this.progresso >= 100) return 'primary';
    if (this.progresso >= 75) return 'accent';
    return 'warn';
  }

  formatarSegundos(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
  }

  private formatarDataApi(date: Date): string {
    const dia = ('0' + date.getDate()).slice(-2);
    const mes = ('0' + (date.getMonth() + 1)).slice(-2);
    const ano = date.getFullYear();
    return `${dia}${mes}${ano}`;
  }
}
