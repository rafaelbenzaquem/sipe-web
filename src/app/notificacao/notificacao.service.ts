import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import {UsuarioService} from '../usuario/usuario.service';
import {PontoService} from '../ponto/ponto.service';
import {Usuario} from '../usuario/usuario.model';
import {Notificacao} from './notificacao.model';

const STORAGE_KEY = 'sipe_notif_lidas';
const CACHE_MS = 5 * 60 * 1000; // 5 minutos entre atualizações

@Injectable({providedIn: 'root'})
export class NotificacaoService {

  private readonly _notificacoes = new BehaviorSubject<Notificacao[]>([]);

  /** Emite todas as notificações não lidas pelo usuário atual. */
  readonly notificacoes$: Observable<Notificacao[]> = this._notificacoes.pipe(
    map(notifs => notifs.filter(n => !this.lidas.has(n.id)))
  );

  private lidas: Set<string> = this.carregarLidasDoStorage();
  private ultimaAtualizacao: number | null = null;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private pontoService: PontoService
  ) {}

  /**
   * Carrega notificações conforme o perfil do usuário autenticado.
   * Respeita cache de 5 minutos; passe forceRefresh=true para ignorar o cache.
   */
  carregarNotificacoes(forceRefresh = false): void {
    const usuario = this.authService.getUsuario();
    if (!usuario?.matricula) return;

    const agora = Date.now();
    if (!forceRefresh && this.ultimaAtualizacao && (agora - this.ultimaAtualizacao) < CACHE_MS) return;

    this.ultimaAtualizacao = agora;

    if (this.authService.hasAnyRole(['GRP_SIPE_ADMIN', 'GRP_SIPE_RH'])) {
      this.carregarParaAdminRH();
    } else if (this.authService.hasRole('GRP_SIPE_DIRETOR')) {
      this.carregarParaDiretor(usuario.matricula);
    } else if (this.authService.hasRole('GRP_SIPE_USERS')) {
      this.carregarParaUsuario(usuario);
    }
  }

  /**
   * Marca uma notificação como lida: persiste em localStorage e re-emite a lista.
   */
  marcarComoLida(id: string): void {
    this.lidas.add(id);
    this.salvarLidasNoStorage();
    this._notificacoes.next(this._notificacoes.value); // re-emite para o pipe filtrar
  }

  /** Força atualização completa após ação do usuário (ex: após salvar um registro). */
  invalidarCache(): void {
    this.ultimaAtualizacao = null;
  }

  // ─── Carregamento por perfil ──────────────────────────────────────────────

  /**
   * ADMIN / RH: notifica sobre qualquer usuário do sistema com pedido pendente.
   */
  private carregarParaAdminRH(): void {
    const {inicio, fim} = this.getPeriodo();

    this.usuarioService.listar().subscribe({
      next: (response) => {
        const usuarios = (response._embedded?.usuarios ?? []).map(u => Usuario.toModel(u));
        this.verificarPendentes(usuarios, inicio, fim);
      },
      error: () => {}
    });
  }

  /**
   * DIRETOR: notifica apenas sobre usuários do seu setor com pedido pendente.
   */
  private carregarParaDiretor(matriculaDiretor: string): void {
    const {inicio, fim} = this.getPeriodo();

    this.usuarioService.listarPorDiretor(matriculaDiretor).subscribe({
      next: (response) => {
        const usuarios = (response._embedded?.usuarios ?? []).map(u => Usuario.toModel(u));
        this.verificarPendentes(usuarios, inicio, fim);
      },
      error: () => {}
    });
  }

  /**
   * Lógica compartilhada para ADMIN/RH e DIRETOR:
   * verifica em paralelo quais usuários possuem pedidos pendentes e gera notificações.
   */
  private verificarPendentes(usuarios: Usuario[], inicio: string, fim: string): void {
    if (usuarios.length === 0) {
      this._notificacoes.next([]);
      return;
    }

    const checks = usuarios.map(u =>
      this.pontoService.existePontoComPedidoAlteracaoPendente(u.matricula!, inicio, fim).pipe(
        map(temPendente => ({usuario: u, temPendente})),
        catchError(() => of({usuario: u, temPendente: false}))
      )
    );

    forkJoin(checks).subscribe({
      next: (resultados) => {
        const notifs: Notificacao[] = resultados
          .filter(r => r.temPendente)
          .map(r => ({
            id: `${r.usuario.matricula}_pendente`,
            titulo: 'Solicitação pendente',
            mensagem: `${r.usuario.nome} possui alterações de ponto aguardando aprovação.`,
            icone: 'pending_actions',
            tipo: 'PENDENTE' as const,
            usuario: r.usuario,
            routerLink: ['/pontos/relatorio/pendente'],
            routerState: {usuario: r.usuario}
          }));

        this._notificacoes.next(notifs);
        this.limparLidasObsoletas(notifs);
      },
      error: () => {}
    });
  }

  /**
   * USUÁRIO COMUM: notifica quando uma solicitação própria foi avaliada (aprovada ou rejeitada).
   * Usa pontos com pedido_alteracao_atual_avaliado=true e sem pendência ativa.
   */
  private carregarParaUsuario(usuario: Usuario): void {
    const {inicio, fim} = this.getPeriodo();

    this.pontoService.getPontosUsuario(usuario.matricula!, inicio, fim, false).subscribe({
      next: (response) => {
        const pontos = response._embedded?.pontos ?? [];

        const notifs: Notificacao[] = pontos
          .filter(p => p.pedido_alteracao_atual_avaliado && !p.pedido_alteracao_pendente)
          .map(p => ({
            id: `${p.matricula}_${p.dia}_avaliado`,
            titulo: 'Solicitação avaliada',
            mensagem: `Sua solicitação do dia ${this.formatarDiaExibicao(p.dia)} foi avaliada.`,
            icone: 'task_alt',
            tipo: 'AVALIADO' as const,
            usuario: usuario,
            routerLink: ['/pontos/relatorio'],
            routerState: {usuario: usuario}
          }));

        this._notificacoes.next(notifs);
        this.limparLidasObsoletas(notifs);
      },
      error: () => {}
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Retorna o período de referência (mesmo critério de ConsultaComponent).
   */
  private getPeriodo(): {inicio: string; fim: string} {
    return {
      inicio: this.formatarData(this.getDataInicial()),
      fim: this.formatarData(new Date())
    };
  }

  private getDataInicial(): Date {
    const hoje = new Date();
    if (hoje.getDate() > 10) {
      return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }
    const mesAnterior = hoje.getMonth() === 0 ? 11 : hoje.getMonth() - 1;
    const anoAnterior = hoje.getMonth() === 0 ? hoje.getFullYear() - 1 : hoje.getFullYear();
    return new Date(anoAnterior, mesAnterior, 1);
  }

  private formatarData(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    return `${dia}${mes}${date.getFullYear()}`;
  }

  /**
   * Converte "DDMMYYYY" → "DD/MM/YYYY" para exibição.
   */
  private formatarDiaExibicao(dia: string): string {
    if (!dia || dia.length !== 8) return dia;
    return `${dia.substring(0, 2)}/${dia.substring(2, 4)}/${dia.substring(4, 8)}`;
  }

  /**
   * Remove do localStorage IDs de notificações que não existem mais na resposta da API,
   * evitando crescimento indefinido do storage.
   */
  private limparLidasObsoletas(notificacoesAtuais: Notificacao[]): void {
    const idsAtuais = new Set(notificacoesAtuais.map(n => n.id));
    const antes = this.lidas.size;
    this.lidas = new Set([...this.lidas].filter(id => idsAtuais.has(id)));
    if (this.lidas.size !== antes) {
      this.salvarLidasNoStorage();
    }
  }

  private carregarLidasDoStorage(): Set<string> {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      return new Set<string>();
    }
  }

  private salvarLidasNoStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.lidas]));
    } catch {
      // Private browsing ou storage cheio: ignora silenciosamente
    }
  }
}
