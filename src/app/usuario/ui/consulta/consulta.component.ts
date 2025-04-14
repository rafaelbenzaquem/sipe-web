import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input'
import {MatCardModule} from '@angular/material/card'
import {FlexLayoutModule} from '@angular/flex-layout'
import {MatIconModule} from '@angular/material/icon'
import {FormsModule} from '@angular/forms'
import {MatTableModule} from '@angular/material/table'
import {MatButtonModule} from '@angular/material/button';
import {Router} from '@angular/router';
import {Usuario} from '../../usuario.model';
import {UsuarioService} from '../../usuario.service';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';

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
    MatProgressBarModule
  ],
  templateUrl: './consulta.component.html',
  styleUrl: './consulta.component.scss'
})
export class ConsultaComponent implements OnInit {

  isLoading = false;
  nomeBusca: string = '';
  usuarios: Usuario[] = [];
  colunasTable: string[] = ["id", "nome", "matricula", "cracha", "hora_diaria", "acoes"]

  private debouncedBuscaUsuarios: (page: number, size: number, nome: string) => void;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
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


  handlePageEvent(e: PageEvent) {
    this.buscaUsuarios(e.pageIndex, e.pageSize);
  }

  buscaUsuarios(page: number, size: number, nome: string = "") {
    this.usuarioService.getUsuarios(page, size, nome).subscribe(response => {
      this.usuarios = response._embedded.usuarios.map(Usuario.toModel);
      this.length = response.page.totalElements;
    });
    this.isLoading = false;
  }

  onInput(event: Event) {
    this.isLoading = true;
    this.debouncedBuscaUsuarios(0, 5, this.nomeBusca);
  }

  preparaEditar(id: string) {
    console.log("preparaEditar " + id)
    // this.router.navigate(['/cadastro'], { queryParams: { "id": id } } )
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

}
