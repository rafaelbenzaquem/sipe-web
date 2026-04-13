import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {forkJoin, interval, Observable, of} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {AuthService} from '../../../auth/auth.service';
import {UsuarioService} from '../../usuario.service';
import {PontoService} from '../../../ponto/ponto.service';
import {Usuario} from '../../usuario.model';
import {Ponto} from '../../../ponto/ponto.model';
import {Registro} from '../../../registro/registro.model';
import {Lotacao, LOTACOES} from '../../../shared/lotacao.data';
import {RegistroService} from '../../../registro/registro.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export type StatusJornada = 'em_expediente' | 'em_intervalo' | 'falha_catraca';

export interface LinhaTabela {
  usuario: Usuario;
  ponto: Ponto | null;
  registros: Registro[];
}

@Component({
  standalone: true,
  selector: 'app-dashboard-tabela',
  imports: [
    AsyncPipe,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FlexLayoutModule

  ],
  templateUrl: './dashboard-tabela.component.html',
  styleUrl: './dashboard-tabela.component.scss'
})
export class DashboardTabelaComponent implements OnInit {

  linhas: LinhaTabela[] = [];
  carregando = true;
  readonly colunas = ['nome', 'matricula', 'entradaInicial', 'horasTrabalhadas', 'horasRestantes', 'progresso', 'status'];

  /* Filtro de lotação (apenas Admin/RH) */
  readonly lotacaoCtrl = new FormControl('');
  readonly lotacoes: Lotacao[] = LOTACOES;
  private readonly destroyRef = inject(DestroyRef);
  lotacoesFiltradas: Observable<Lotacao[]>;
  lotacaoSelecionada?: Lotacao;
  carregandoFiltro = false;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private registroService: RegistroService,
    private pontoService: PontoService,
    private cdr: ChangeDetectorRef
  ) {
    this.lotacoesFiltradas = this.lotacaoCtrl.valueChanges.pipe(
      startWith(''),
      map(v => v ? this.filtrarLotacoes(v) : this.lotacoes.slice())
    );
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.carregarDados();
    this.iniciarCronometro();
  }

  get titulo(): string {
    const sigla = this.lotacaoSelecionada?.sigla;
    if (this.authService.hasRole('GRP_SIPE_DIRETOR')) return 'Ponto do Setor — Hoje';
    return sigla ? `Ponto do Setor ${sigla} — Hoje` : 'Ponto Geral — Hoje';
  }

  get isAdminOuRH(): boolean {
    return this.authService.hasAnyRole(['GRP_SIPE_ADMIN', 'GRP_SIPE_RH']);
  }

  /** Linhas exibidas: ponto existe e há ao menos um registro ativo no dia. */
  get linhasPresentes(): LinhaTabela[] {
    return this.linhas.filter(l => l.ponto !== null && l.registros.length > 0);
  }

  get totalAusentes(): number {
    return this.linhas.filter(l => l.ponto !== null && l.registros.length === 0).length;
  }

  onLotacaoSelect(): void {
    const sigla = this.lotacaoCtrl.getRawValue() || '';
    this.lotacaoSelecionada = this.lotacoes.find(l => l.sigla === sigla);
    this.carregarDados(this.lotacaoSelecionada?.id);
  }

  horasTrabalhadasString(linha: LinhaTabela): string {
    return this.formatarSegundos(this.horasTrabalhadasSegundos(linha));
  }

  primeiraEntradaSegundos(linha: LinhaTabela): number {
    const primeiraEntradaStr = this.primeiraEntradaLinha(linha);
    const primeiraEntradaMs = this.horaParaMs(primeiraEntradaStr);
    return primeiraEntradaMs ? Math.floor(primeiraEntradaMs / 1000) : 0;
  }

  ultimaEntradaSegundos(linha: LinhaTabela): number {
    const ultimaEntradaStr = this.ultimaEntradaLinha(linha);
    const ultimaEntradaMs = this.horaParaMs(ultimaEntradaStr);
    return ultimaEntradaMs ? Math.floor(ultimaEntradaMs / 1000) : 0;
  }


  ultimaSaidaSegundos(linha: LinhaTabela): number {
    const ultimaSaidaStr = this.ultimaSaidaLinha(linha);
    const ultimaSaidaMs = this.horaParaMs(ultimaSaidaStr);
    return ultimaSaidaMs ? Math.floor(ultimaSaidaMs / 1000) : 0;
  }

  horasTrabalhadasSegundos(linha: LinhaTabela): number {
    const primeiraEntradaSec = this.primeiraEntradaSegundos(linha);
    const ultimaEntradaSec = this.ultimaEntradaSegundos(linha);
    const ultimaSaidaSec = this.ultimaSaidaSegundos(linha);
    const horarioAtual = this.horarioAtualEmSegundos;
    const horarioFinal = ultimaSaidaSec == null ? horarioAtual : ultimaSaidaSec > ultimaEntradaSec ? ultimaSaidaSec : horarioAtual;
    return linha.ponto ?
      linha.ponto.total_segundos ? ((horarioFinal - ultimaEntradaSec) + linha.ponto.total_segundos) : horarioAtual - primeiraEntradaSec : 0;
  }

  get horarioAtualEmSegundos(): number {
    return Math.floor(Date.now() / 1000);
  }

  horasRestantes(linha: LinhaTabela): string {
    if (!linha.usuario.hora_diaria || !linha.ponto) return '00:00:00';
    const restantes = Math.abs((linha.usuario.hora_diaria * 3600) - this.horasTrabalhadasSegundos(linha));
    return restantes >= 0 ? this.formatarSegundos(restantes) : '00:00:00';
  }

  progresso(linha: LinhaTabela): number {
    if (!linha.usuario.hora_diaria || !linha.ponto) return 0;
    return Math.min(100, Math.round((this.horasTrabalhadasSegundos(linha) / (linha.usuario.hora_diaria * 3600)) * 100));
  }

  corProgresso(linha: LinhaTabela): 'primary' | 'accent' | 'warn' {
    const p = this.progresso(linha);
    if (p >= 100) return 'primary';
    if (p >= 75) return 'accent';
    return 'warn';
  }

  /**
   * Determina o status da jornada com base na sequência de registros:
   * - falha_catraca : primeiro registro é Saída (sem entrada antecedente)
   * - em_intervalo  : último registro é Saída com pelo menos uma Entrada anterior
   * - em_expediente : último registro é Entrada (usuário dentro do setor)
   */
  statusJornada(linha: LinhaTabela): StatusJornada {
    const regs = [...linha.registros].sort((a, b) => a.hora.localeCompare(b.hora));
    if (regs.length === 0) return 'em_expediente';
    if (regs[0].sentido === 'Saída') return 'falha_catraca';
    if (regs[regs.length - 1].sentido === 'Saída') return 'em_intervalo';
    return 'em_expediente';
  }

  /** Hora do primeiro registro de Entrada do dia. */

  registrosOrdenados(linha: LinhaTabela) {
    return [...linha.registros].sort((a, b) => a.hora.localeCompare(b.hora));
  }

  primeiraEntradaLinha(linha: LinhaTabela): string {
    const sorted = this.registrosOrdenados(linha);
    const entrada = sorted.find(r => r.sentido === 'Entrada');
    return entrada ? entrada.hora : '---';
  }

  ultimaSaidaLinha(linha: LinhaTabela): string {
    const saidas = this.registrosOrdenados(linha).filter(r => r.sentido === 'Saída');
    return saidas.length > 0 ? saidas[saidas.length - 1].hora : '---';
  }

  ultimaEntradaLinha(linha: LinhaTabela): string {
    const saidas = this.registrosOrdenados(linha).filter(r => r.sentido === 'Entrada');
    return saidas.length > 0 ? saidas[saidas.length - 1].hora : '---';
  }

  /**
   * Carrega usuários e seus pontos + registros de hoje em paralelo.
   * Fluxo: usuários → forkJoin(pontos) → forkJoin(registros) via switchMap.
   */
  private carregarDados(idLotacao?: number): void {
    this.carregando = true;
    this.linhas = [];
    const hoje = this.formatarDataApi(new Date());
    const matricula = this.authService.getUsuario()?.matricula ?? '';

    const usuarios$ = this.authService.hasRole('GRP_SIPE_DIRETOR')
      ? this.usuarioService.listarPorDiretor(matricula)
      : idLotacao !== undefined
        ? this.usuarioService.listar('', '', '', idLotacao)
        : this.usuarioService.listar();

    usuarios$.subscribe({
      next: (response) => {
        const usuarios = (response._embedded?.usuarios ?? []).map(u => Usuario.toModel(u));

        if (usuarios.length === 0) {
          this.carregando = false;
          return;
        }

        // 1ª rodada: pontos de hoje em paralelo
        const pontoRequests = usuarios.map(u =>
          this.pontoService.getPonto(u.matricula!, hoje).pipe(
            map(p => Ponto.toModel(p)),
            catchError(() => of(null))
          )
        );

        forkJoin(pontoRequests).pipe(
          // 2ª rodada: registros em paralelo para usuários que possuem ponto
          switchMap(pontos =>
            forkJoin(
              usuarios.map((u, i) =>
                pontos[i] !== null
                  ? this.registroService.listaTodos(u.matricula!, hoje).pipe(
                    map(r => (r._embedded?.registros ?? [])
                      .map(rr => Registro.toModel(rr))
                      .filter(rr => rr.ativo)),
                    catchError(() => of([] as Registro[]))
                  )
                  : of([] as Registro[])
              )
            ).pipe(map(registrosLista => ({pontos, registrosLista})))
          )
        ).subscribe({
          next: ({pontos, registrosLista}) => {
            this.linhas = usuarios.map((u, i) => ({
              usuario: u,
              ponto: pontos[i],
              registros: registrosLista[i]
            }));
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


  private iniciarCronometro(): void {
    interval(1000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.cdr.markForCheck();
    });
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

  private filtrarLotacoes(value: string): Lotacao[] {
    const filtro = value.toLowerCase();
    return this.lotacoes.filter(l =>
      l.sigla.toLowerCase().includes(filtro) || l.descricao.toLowerCase().includes(filtro)
    );
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
