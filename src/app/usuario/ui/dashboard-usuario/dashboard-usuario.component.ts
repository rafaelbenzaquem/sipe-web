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
import {AuthService} from '../../../auth/auth.service';
import {PontoService} from '../../../ponto/ponto.service';
import {RegistroService} from '../../../registro/registro.service';
import {Usuario} from '../../usuario.model';
import {Ponto} from '../../../ponto/ponto.model';
import {Registro} from '../../../registro/registro.model';

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

  /** Segundos restantes no cronômetro decrescente (descontando pausas). */
  segundosRestantes = 0;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private pontoService: PontoService,
    private registroService: RegistroService,
    private cdr: ChangeDetectorRef
  ) {
  }

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
        // Busca todos os registros (inclusive inativos) para diagnóstico completo
        return this.registroService.listaTodos(matricula, hojeApi);
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

        if (!this.estaAusente && !this.falhaCatraca) {
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

  timeString(seconds: number): string {
    return (new Date(seconds * 1000)).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }


  // ── Estado de presença ──────────────────────────────────────────────────────

  get estaAusente(): boolean {
    return !this.carregando && this.registros.length === 0;
  }

  /**
   * Primeiro registro do dia é uma Saída — a catraca registrou saída sem entrada
   * antecedente (falha de equipamento ou entrada manual necessária).
   */
  get falhaCatraca(): boolean {
    const sorted = this.registrosOrdenados;
    return sorted.length > 0 && sorted[0].sentido === 'Saída';
  }

  /**
   * Último registro é Entrada — usuário está no setor.
   * Inclui retorno de intervalo (E→S→E: o último continua sendo Entrada).
   */
  get emExpediente(): boolean {
    const sorted = this.registrosOrdenados;
    return sorted.length > 0 && sorted[sorted.length - 1].sentido === 'Entrada';
  }

  /**
   * Último registro é Saída e havia pelo menos uma Entrada anterior —
   * usuário saiu (intervalo ou saída definitiva do dia).
   */
  get emIntervalo(): boolean {
    const sorted = this.registrosOrdenados;
    if (sorted.length === 0) return false;
    return sorted[sorted.length - 1].sentido === 'Saída'
      && sorted.some(r => r.sentido === 'Entrada');
  }

  // ── Exibição ────────────────────────────────────────────────────────────────

  get primeiraEntrada(): string {
    const entrada = this.registrosOrdenados.find(r => r.sentido === 'Entrada');
    return entrada ? entrada.hora : '---';
  }

  get ultimaSaida(): string {
    const saidas = this.registrosOrdenados.filter(r => r.sentido === 'Saída');
    return saidas.length > 0 ? saidas[saidas.length - 1].hora : '---';
  }

  get ultimaEntrada(): string {
    const entradas = this.registrosOrdenados.filter(r => r.sentido === 'Entrada');
    return entradas.length > 0 ? entradas[entradas.length - 1].hora : '---';
  }

  get horasTrabalhadasString(): string {
    return this.formatarSegundos(this.horasTrabalhadasSegundos);
  }

  get ultimaEntradaSegundos(): number {
    const ultimaEntradaStr = this.ultimaEntrada;
    const ultimaEntradaMs = this.horaParaMs(ultimaEntradaStr);
    return ultimaEntradaMs ? Math.floor(ultimaEntradaMs / 1000) : 0;
  }

  get primeiraEntradaSegundos(): number {
    const primeiraEntradaStr = this.primeiraEntrada;
    const primeiraEntradaMs = this.horaParaMs(primeiraEntradaStr);
    return primeiraEntradaMs ? Math.floor(primeiraEntradaMs / 1000) : 0;
  }

  get horasTrabalhadasSegundos(): number {
    const primeiraEntradaSec = this.primeiraEntradaSegundos;
    const ultimaEntradaSec = this.ultimaEntradaSegundos;
    const horarioAtual = this.horarioAtualEmSegundos;

    return this.ponto ?
      this.ponto.total_segundos ? ((horarioAtual - ultimaEntradaSec) + this.ponto.total_segundos) : horarioAtual - primeiraEntradaSec : 0;
  }

  get horarioAtualEmSegundos(): number {
    return Math.floor(Date.now() / 1000);
  }

  get cronometroExibicao(): string {
    const horasTrabalhadasSegundos = this.horasTrabalhadasSegundos;
    const horasDiariasSegundos = this.usuario?.hora_diaria ? this.usuario?.hora_diaria * 60 * 60 : 8 * 60 * 60;

    return this.formatarSegundos(horasDiariasSegundos-horasTrabalhadasSegundos);
  }

  get progresso(): number {
    if (!this.usuario?.hora_diaria || !this.ponto) return 0;
    return Math.min(100, Math.round((this.horasTrabalhadasSegundos / (this.usuario.hora_diaria * 3600)) * 100));
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

  formatarHoras(horas: number): string {
    const h = horas % 24;
    const m = 0;
    const s = 0;
    return `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
  }

  // ── Cronômetro ──────────────────────────────────────────────────────────────

  /**
   * Inicia o cronômetro decrescente, descontando automaticamente os períodos
   * de ausência detectados entre registros de Saída e a próxima Entrada.
   *
   * Algoritmo: percorre os registros ordenados em pares (Entrada/Saída).
   * Cada par contribui (Saída − Entrada) para o tempo efetivo trabalhado.
   * Se o último registro for uma Entrada sem Saída correspondente, soma
   * (agora − Entrada) como tempo em curso.
   */
  private iniciarCronometro(): void {
    if (!this.usuario?.hora_diaria) return;

    const calcularRestantes = () => {
      const efetivos = this.calcularSegundosEfetivos();
      return Math.max(0, this.usuario!.hora_diaria! * 3600 - efetivos);
    };

    this.segundosRestantes = calcularRestantes();

    interval(1000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.segundosRestantes = calcularRestantes();
      this.cdr.markForCheck();
    });
  }

  /**
   * Calcula o total de segundos efetivamente trabalhados no dia,
   * excluindo os intervalos entre Saída e a próxima Entrada.
   */
  private calcularSegundosEfetivos(): number {
    const regs = this.registrosOrdenados;
    const agora = Date.now();
    let total = 0;
    let i = 0;

    while (i < regs.length) {
      if (regs[i].sentido === 'Entrada') {
        const entradaMs = this.horaParaMs(regs[i].hora);
        if (entradaMs === null) {
          i++;
          continue;
        }

        if (i + 1 < regs.length && regs[i + 1].sentido === 'Saída') {
          // Par Entrada→Saída: período trabalhado delimitado
          const saidaMs = this.horaParaMs(regs[i + 1].hora);
          if (saidaMs !== null) {
            total += Math.max(0, Math.floor((saidaMs - entradaMs) / 1000));
          }
          i += 2;
        } else {
          // Entrada sem Saída correspondente → ainda em curso
          total += Math.max(0, Math.floor((agora - entradaMs) / 1000));
          i++;
        }
      } else {
        // Saída órfã (falha de catraca) — ignorada no cálculo
        i++;
      }
    }

    return total;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private get registrosOrdenados(): Registro[] {
    return [...this.registros].sort((a, b) => a.hora.localeCompare(b.hora));
  }

  /** Converte "HH:MM" ou "HHMM" para timestamp (ms) do dia de hoje. */
  private horaParaMs(hora: string): number | null {
    const parsed = this.parseHora(hora);
    if (!parsed) return null;
    const d = new Date();
    d.setHours(parsed.h, parsed.m, 0, 0);
    return d.getTime();
  }

  /** Suporta formatos "HH:MM" e "HHMM". */
  private parseHora(hora: string): { h: number; m: number } | null {
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
