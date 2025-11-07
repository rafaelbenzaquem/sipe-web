import {Component, inject, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input'
import {MatCardModule} from '@angular/material/card'
import {FlexLayoutModule} from '@angular/flex-layout'
import {MatIconModule} from '@angular/material/icon'
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatTableModule} from '@angular/material/table'
import {MatButtonModule} from '@angular/material/button';
import {Usuario} from '../../usuario.model';
import {UsuarioService} from '../../usuario.service';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialog,} from '@angular/material/dialog';
import {AtualizacaoUsuarioDialog} from '../dialogs/dialogs.utils';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../auth/auth.service';
import {PontoService} from '../../../ponto/ponto.service';
import {Observable} from 'rxjs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {map, startWith} from 'rxjs/operators';
import {RelatorioService} from '../../../ponto/relatorio.service';

export interface Lotacao {
  id: number;
  sigla: string;
  descricao: string;
}

@Component({
  selector: 'app-consulta',
  imports: [
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    FlexLayoutModule,
    FormsModule,
    CommonModule,
    MatPaginatorModule,
    MatProgressBarModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    AsyncPipe
  ],
  templateUrl: './consulta.component.html',
  styleUrl: './consulta.component.scss'
})
export class ConsultaComponent implements OnInit {
  lotacaoCtrl = new FormControl('');
  lotacoesFiltradas: Observable<Lotacao[]>;
  lotacaoSelecionada?: Lotacao;
  carregandoSelecao = false;
  carregandoBusca = false;
  nomeBusca: string = '';
  usuarios: Usuario[] = [];
  usuariosFull: Usuario[] = [];
  colunasTable: string[] = ["nome", "matricula", "cracha", "hora_diaria", "acoes"]
  lotacoes: Lotacao[] = [
    {id: 15, sigla: 'SJRR', descricao: 'SECAO JUDICIARIA DE RORAIMA'},
    {id: 112, sigla: '1ª VARA', descricao: '1ª VARA DA SJRR'},
    {id: 124, sigla: '2ª VARA', descricao: '2ª VARA DA SJRR'},
    {id: 136, sigla: '3ª VARA', descricao: '3ª VARA (JEF) DA SJRR'},
    {id: 215, sigla: '4ª VARA', descricao: '4ª VARA DA SJRR'},
    {id: 70, sigla: 'DIREF', descricao: 'DIRETORIA DO FORO'},
    {id: 77, sigla: 'SECAD', descricao: 'SECRETARIA ADMINISTRATIVA'},
    {id: 226, sigla: 'CEJUC', descricao: 'CENTRO JUDICIÁRIO DE CONCILIAÇÃO'},
    {id: 245, sigla: 'ASJUR', descricao: 'ASSESSORIA JURÍDICA E LEGISLAÇÃO DE PESSOAL'},
    {id: 246, sigla: 'SEAUD', descricao: 'SEÇÃO DE AUDITORIA INTERNA'},
    {id: 224, sigla: 'NUCJU', descricao: 'NÚCLEO JUDICIÁRIO'},
    {id: 227, sigla: 'NUCAD', descricao: 'NÚCLEO DE ADMINISTRAÇÃO'},
    {id: 253, sigla: 'NUCAF', descricao: 'NÚCLEO DE ADMINISTRAÇÃO ORÇAMENTÁRIA, FINANCEIRA E PATRIMONIAL'},
    {id: 263, sigla: 'NUTEC', descricao: 'NÚCLEO DE TECNOLOGIA DA INFORMAÇÃO'}
  ];

  readonly dialog = inject(MatDialog);
  private debouncedBuscaUsuarios: (page: number, size: number, nome: string, matricula: string, cracha: string) => void;

  constructor(
    private usuarioService: UsuarioService,
    private pontoService: PontoService,
    private authService: AuthService,
    private relatorioService: RelatorioService,
  ) {
    this.lotacoesFiltradas = this.lotacaoCtrl.valueChanges.pipe(
      startWith(''),
      map(lotacao => lotacao ? this._filtroLotacoes(lotacao) : this.lotacoes.slice()),);
    this.debouncedBuscaUsuarios = this.debounce(this.buscaUsuarios.bind(this), 1000);
  }

  length = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [25, 50, 100];


  ngOnInit(): void {
    console.log("Consultado lista de usuários");
    this.buscaUsuarios(0, this.pageSize);
  }


  pendenciasMap: Map<string, Observable<boolean>> = new Map();

  mapPendencias(usuario: Usuario): Observable<boolean> {
    let matricula = usuario.matricula || "";
    if (!this.pendenciasMap.has(matricula)) {
      this.pendenciasMap.set(matricula, this.temPendencias(usuario));
    }
    return this.pendenciasMap.get(matricula)!;
  }

  handlePageEvent(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.usuarios = this.sliceUsuarios();
  }

  buscaUsuarios(page: number, size: number, nome: string = "", matricula: string = "", cracha: string = "") {
    this.carregandoBusca = true;
    this.usuarioService.listar(nome, matricula, cracha).subscribe(response => {
      this.usuariosFull = response._embedded.usuarios.map(Usuario.toModel);
      this.length = this.usuariosFull.length;
      this.pageIndex = page;
      this.pageSize = size;
      this.usuarios = this.sliceUsuarios();
      this.carregandoBusca = false;
    }, _ => {
      this.carregandoBusca = false;
    });
  }

  selecionaUsuarios(id_lotacao: number = 15) {
    this.usuarioService.listar('', '', '', id_lotacao).subscribe(response => {
      this.usuariosFull = response._embedded.usuarios.map(Usuario.toModel);
      this.length = this.usuariosFull.length;
      this.usuarios = this.sliceUsuarios();
      this.carregandoSelecao = false;
    }, _ => {
      this.carregandoSelecao = false;
    });
  }

  private sliceUsuarios(): Usuario[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.usuariosFull.slice(start, end);
  }

  buscarLotacaoPorAtributo<T extends keyof Lotacao>(
    lotacoes: Lotacao[],
    atributo: T,
    valor: Lotacao[T]
  ): Lotacao | undefined {
    return lotacoes.find(lotacao => lotacao[atributo] === valor);
  }

  onSelect() {
    this.carregandoSelecao = true;
    let sigla = this.lotacaoCtrl.getRawValue() || '';
    this.lotacaoSelecionada = this.buscarLotacaoPorAtributo(this.lotacoes, 'sigla', sigla);
    this.selecionaUsuarios(this.lotacaoSelecionada?.id || 15);
  }

  async baixarRelatorio() {
    if (this.hasAnyRole(['GRP_SIPE_ADMIN', 'GRP_SIPE_RH'])) {
      this.carregandoSelecao = true;
      try {
        if (this.lotacaoSelecionada) {
          await this.relatorioService.downloadRelatorioLotacao(this.lotacaoSelecionada.id, this.getDataInicial(), new Date());
          console.log('Download do relatório iniciado com sucesso.');
        }
      } catch (error) {
        console.error('Falha ao iniciar o download do relatório:', error);
        // Lógica para lidar com o erro (exibir mensagem ao usuário, etc.)
      }
      this.carregandoSelecao = false;
    } else if (this.hasAnyRole(['GRP_SIPE_DIRETOR'])) {
      this.carregandoSelecao = true;
      try {
        if (this.usuario && this.usuario.matricula) {
          await this.relatorioService.downloadRelatorioLotacaoPorDiretor(this.usuario.matricula, this.getDataInicial(), new Date());
          console.log('Download do relatório iniciado com sucesso.');
        }
      } catch (error) {
        console.error('Falha ao iniciar o download do relatório:', error);
        // Lógica para lidar com o erro (exibir mensagem ao usuário, etc.)
      }
      this.carregandoSelecao = false;
    }
  }


  onInput(event: Event) {
    this.carregandoBusca = true;
    this.debouncedBuscaUsuarios(0, this.pageSize, this.nomeBusca, this.nomeBusca, this.nomeBusca);
  }

  preparaEditar(usuario: Usuario) {

    this.dialog.open(AtualizacaoUsuarioDialog, {
      width: '500px',
      data: usuario
    });
  }


  debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  get usuario() {
    return this.authService.getUsuario();
  }

  /**
   * Verifica se possui determinada permissão
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Verifica se possui ao menos uma das permissões
   */
  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  temPendencias(usuario: Usuario): Observable<boolean> {
    const matricula = usuario.matricula || "";
    const dataInicio = this.formatDate(this.getDataInicial()); // Primeiro dia do mês atual
    const dataFim = this.getDataAtual(); // Data atual
    return this.pontoService.existePontoComPedidoAlteracaoPendente(matricula, dataInicio, dataFim);
  }

  private getDataInicial(): Date {
    const hoje = new Date();

    let inicioSelecionado: Date;

    if (hoje.getDate() > 10) {
      // Primeiro dia do mês atual
      inicioSelecionado = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    } else {
      // Primeiro dia do mês anterior
      const mesAnterior = hoje.getMonth() === 0 ? 11 : hoje.getMonth() - 1;
      const anoAnterior = hoje.getMonth() === 0 ? hoje.getFullYear() - 1 : hoje.getFullYear();
      inicioSelecionado = new Date(anoAnterior, mesAnterior, 1);
    }

    return inicioSelecionado;
  }

  private getDataAtual(): string {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  }

  private _filtroLotacoes(value: string): Lotacao[] {
    const valorFiltrado = value.toLowerCase();
    return this.lotacoes.filter(lotacao => lotacao.sigla.toLowerCase().includes(valorFiltrado));
  }

}

