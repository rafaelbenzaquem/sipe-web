import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {interval} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {AuthService} from '../../auth/auth.service';
import {PontoService} from '../../ponto/ponto.service';
import {RegistroService} from '../../registro/registro.service';
import {Usuario} from '../../usuario/usuario.model';
import {Ponto} from '../../ponto/ponto.model';
import {Registro} from '../../registro/registro.model';

@Component({
  standalone: true,
  selector: 'app-dashboard-usuario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
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

  /** Segundos restantes calculados a partir da hora de entrada — alimenta o cronômetro. */
  segundosRestantes = 0;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private pontoService: PontoService,
    private registroService: RegistroService,
    private cdr: ChangeDetectorRef
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
      this.cdr.markForCheck();
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
          this.registros = response._embedded.registros
            .map(r => Registro.toModel(r))
            .filter(r => r.ativo);
        }
        this.carregando = false;

        if (!this.estaAusente) {
          this.iniciarCronometro();
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get estaAusente(): boolean {
    return !this.carregando && this.registros.length === 0;
  }

  get primeiraEntrada(): string {
    const entradas = this.registros.filter(r => r.sentido === 'Entrada');
    return entradas.length > 0 ? entradas[0].hora : '---';
  }

  get ultimaSaida(): string {
    const saidas = this.registros.filter(r => r.sentido === 'Saída');
    return saidas.length > 0 ? saidas[saidas.length - 1].hora : '---';
  }

  get horasTrabalhadas(): string {
    return this.ponto ? this.formatarSegundos(this.ponto.total_segundos) : '00:00:00';
  }

  get cronometroExibicao(): string {
    return this.formatarSegundos(this.segundosRestantes);
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

  get jornadaConcluida(): boolean {
    return this.segundosRestantes === 0 && !this.estaAusente && !this.carregando;
  }

  formatarSegundos(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
  }

  /**
   * Inicia o cronômetro decrescente.
   * Valor inicial: hora_diaria (em segundos) − (hora_atual − hora_primeira_entrada).
   * Atualiza a cada segundo via interval(1000); destrói automaticamente ao sair da página.
   */
  private iniciarCronometro(): void {
    const parsed = this.parseHora(this.primeiraEntrada);
    if (!parsed || !this.usuario?.hora_diaria) return;

    const agora = new Date();
    const entradaHoje = new Date(agora);
    entradaHoje.setHours(parsed.h, parsed.m, 0, 0);

    const calcularRestantes = () => {
      const decorridos = Math.floor((Date.now() - entradaHoje.getTime()) / 1000);
      return Math.max(0, this.usuario!.hora_diaria! * 3600 - decorridos);
    };

    this.segundosRestantes = calcularRestantes();

    interval(1000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.segundosRestantes = calcularRestantes();
      this.cdr.markForCheck();
    });
  }

  /** Suporta formatos "HH:MM" e "HHMM". */
  private parseHora(hora: string): {h: number; m: number} | null {
    if (!hora || hora === '---') return null;
    if (hora.includes(':')) {
      const [h, m] = hora.split(':').map(Number);
      return isNaN(h) || isNaN(m) ? null : {h, m};
    }
    if (hora.length >= 4) {
      const h = parseInt(hora.substring(0, 2), 10);
      const m = parseInt(hora.substring(2, 4), 10);
      return isNaN(h) || isNaN(m) ? null : {h, m};
    }
    return null;
  }

  private formatarDataApi(date: Date): string {
    const dia = ('0' + date.getDate()).slice(-2);
    const mes = ('0' + (date.getMonth() + 1)).slice(-2);
    const ano = date.getFullYear();
    return `${dia}${mes}${ano}`;
  }
}
