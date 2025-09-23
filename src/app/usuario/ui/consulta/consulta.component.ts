import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input'
import {MatCardModule} from '@angular/material/card'
import {FlexLayoutModule} from '@angular/flex-layout'
import {MatIconModule} from '@angular/material/icon'
import {FormsModule} from '@angular/forms'
import {MatTableModule} from '@angular/material/table'
import {MatButtonModule} from '@angular/material/button';
import {Usuario} from '../../usuario.model';
import {UsuarioService} from '../../usuario.service';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialog,} from '@angular/material/dialog';
import {AtualizacaoUsuarioDialog} from '../dialogs/dialogs.utils';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../auth/auth.service';
import {PontoService} from '../../../ponto/ponto.service';
import {Observable} from 'rxjs';

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
    RouterLink
  ],
  templateUrl: './consulta.component.html',
  styleUrl: './consulta.component.scss'
})
export class ConsultaComponent implements OnInit {

  isLoading = false;
  nomeBusca: string = '';
  usuarios: Usuario[] = [];
  colunasTable: string[] = ["id", "nome", "matricula", "cracha", "hora_diaria", "acoes"]
  readonly dialog = inject(MatDialog);
  private debouncedBuscaUsuarios: (page: number, size: number, nome: string) => void;

  constructor(
    private usuarioService: UsuarioService,
    private pontoService: PontoService,
    private router: Router,
    private authService: AuthService
  ) {
    this.debouncedBuscaUsuarios = this.debounce(this.buscaUsuarios.bind(this), 1000);
  }

  length = 0;
  pageSize = 0;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];



  ngOnInit(): void {
    console.log("Consultado lista de usuários");
    this.buscaUsuarios(0, 5);
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
    this.buscaUsuarios(e.pageIndex, e.pageSize);
  }

  buscaUsuarios(page: number, size: number, nome: string = "") {
    this.usuarioService.getUsuarios(page, size, nome).subscribe(response => {
      this.usuarios = response._embedded.usuarios.map(Usuario.toModel).sort(
        (a, b) => {
          if (!a.nome && !b.nome) return 0;
          if (!a.nome) return 1;
          if (!b.nome) return -1;
          return a.nome.localeCompare(b.nome, undefined, {sensitivity: "base"});
        }
      );

      this.length = response.page.totalElements;
    });
    this.isLoading = false;
  }

  onInput(event: Event) {
    this.isLoading = true;
    this.debouncedBuscaUsuarios(0, 5, this.nomeBusca);
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
    return this.pontoService.existePontoComPedidoAlteracaoPendente(matricula, "01092025", "22092025");
  }
}

