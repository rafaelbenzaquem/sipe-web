import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {Ponto} from '../../ponto.model';
import {FormsModule} from '@angular/forms';
import {Registro} from '../../../registro/registro.model';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TimerComponent} from '../../../registro/ui/timer/timer.component'
import {PedidoService} from '../../../alteracao/pedido/pedido.service';
import {AuthService} from '../../../auth/auth.service';
import {Usuario} from '../../../usuario/usuario.model';


export class PontoTableModel {

  dia: string = '';
  descricao: string = '';
  total: string = '00:00:00';
  registros: RegistroListModel[] = [];
  temCreditoDeHoras: boolean = false;
  ponto: Ponto = new Ponto();
  usuario: Usuario = new Usuario();

  static toPontoTableModel(ponto: Ponto, usuario: Usuario = new Usuario() || undefined): PontoTableModel {
    let pontoTableModel = new PontoTableModel();
    pontoTableModel.dia = ponto.dia;
    pontoTableModel.descricao = ponto.descricao;
    pontoTableModel.total = PontoTableModel.formatarSegundosEmHoras(ponto.total_segundos);
    pontoTableModel.registros = ponto.registros.map(RegistroListModel.toRegistroListModel);
    pontoTableModel.temCreditoDeHoras = PontoTableModel.temCreditoDeHoras(ponto.total_segundos, usuario.hora_diaria || 7);
    pontoTableModel.ponto = ponto;
    pontoTableModel.usuario = usuario;
    return pontoTableModel;
  }

  private static formatarSegundosEmHoras(totalSegundos: number): string {
    if (totalSegundos === 0)
      return '00:00:00';
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    const horasFormatadas = String(horas).padStart(2, '0');
    const minutosFormatados = String(minutos).padStart(2, '0');
    const segundosFormatados = String(segundos).padStart(2, '0');

    return `${horasFormatadas}:${minutosFormatados}:${segundosFormatados}`;
  }

  private static temCreditoDeHoras(totalSegundosTrabalhados: number, horasDiarias: number): boolean {

    console.log("Total de Segundos: " + totalSegundosTrabalhados);

    let horasDiariasEmSegundos = horasDiarias * 3600;

    console.log("Carga horária em segundos: " + horasDiariasEmSegundos);


    return totalSegundosTrabalhados >= horasDiariasEmSegundos;
  }

}


export class RegistroListModel {
  sentido: string = '-----';
  hora: string = '--:--';

  criador: string = 'sem criador';
  data_criacao: string = '';

  codigo_acesso: number = 0;

  aprovador: string = 'Não aprovado';
  data_aprovacao: string = 'Não aprovado';

  registro: Registro = new Registro();


  static toRegistroListModel(registro: Registro) {
    let registroListModel = new RegistroListModel();
    registroListModel.sentido = registro.sentido;
    registroListModel.hora = registro.hora;
    registroListModel.codigo_acesso = registro.codigo_acesso;

    registroListModel.criador = registro.matricula_criador;
    registroListModel.data_criacao = RegistroListModel.formatarData(registro.data_criacao);

    registroListModel.aprovador = registro.matricula_aprovador;
    registroListModel.data_aprovacao = RegistroListModel.formatarData(registro.data_aprovacao);

    registroListModel.registro = registro;
    return registroListModel;
  }

  static formatarData(dataStr: string): string {
    if (dataStr) {

      const data = new Date(dataStr);
      if (isNaN(data.getTime())) {
        return 'Não disponível!';
      }

      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0'); // meses começam do zero
      const ano = data.getFullYear();

      const horas = String(data.getHours()).padStart(2, '0');
      const minutos = String(data.getMinutes()).padStart(2, '0');
      const segundos = String(data.getSeconds()).padStart(2, '0');

      return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
    }
    return 'Não disponível!';
  }

}

@Component({
  selector: 'app-tabela-pontos',
  imports: [
    NgForOf,
    FormsModule,
    MatButton,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    TimerComponent
  ],
  templateUrl: './tabela-pontos.component.html',
  styleUrl: './tabela-pontos.component.scss',
  providers: [DatePipe]
})
export class TabelaPontosComponent {


  private _pontos: Ponto[] = [];
  private _usuarioPonto: Usuario = new Usuario();
  private _tamanhoRegistros = 2;
  private _horario: number = 7;
  pontosTableModel: PontoTableModel[] = [];

  constructor(private pedidoService: PedidoService,
              private authService: AuthService) {
  }


  @Input()
  set usuarios(v: Usuario) {
    this._usuarioPonto = v ;
    this.updateTableModel();
  }

  get usuarios(): Usuario {
    return this._usuarioPonto;
  }

  /** Pontos de entrada; reconstrói o modelo da tabela quando alterar */
  @Input()
  set pontos(v: Ponto[]) {
    this._pontos = v || [];
    this.updateTableModel();
  }

  get pontos(): Ponto[] {
    return this._pontos;
  }

  /** Número de colunas de registros; reconstrói o modelo da tabela quando alterar */
  @Input()
  set tamanhoRegistros(v: number) {
    this._tamanhoRegistros = v || 0;
    this.updateTableModel();
  }

  get tamanhoRegistros(): number {
    return this._tamanhoRegistros;
  }

  @Input()
  set horario(v: number) {
    this._horario = v || 8;
  }

  get horario(): number {
    return this._horario;
  }


  @Output() editar = new EventEmitter<Ponto>();
  @Output() aprovar = new EventEmitter<Ponto>();


  // /** Reconstrói o modelo de exibição a partir dos inputs atuais */
  // private updateTableModel(): void {
  //   this.pontosTableModel = this.criaPontosTableModel(this._pontos, this._tamanhoRegistros);
  // }


  criaPontosTableModel(pontos: Ponto[], maiorLista: number, usuario: Usuario = new Usuario() || undefined): PontoTableModel[] {
    // let maiorLista = this.verificaMaiorListaDeRegistro(pontos);
    let pontoTableModelList: PontoTableModel[] = [];
    pontoTableModelList = pontos.map(p => PontoTableModel.toPontoTableModel(p, usuario))
    pontoTableModelList.forEach(ponto => {
      if (ponto.registros) {

        let elementosFaltantes = maiorLista - ponto.registros.length;

        for (let i = 0; i < elementosFaltantes; i++) {
          ponto.registros.push(new RegistroListModel());
        }
      }
    })
    return pontoTableModelList;
  }


  displayedColumns: string[] = [];

  ngOnInit(): void {
    this.atualizaColunas();
  }

  private updateTableModel(): void {
    this.pontosTableModel = this.criaPontosTableModel(this._pontos, this._tamanhoRegistros);
    this.atualizaColunas();
  }

  private atualizaColunas(): void {
    this.displayedColumns = ['dia'];
    for (let i = 0; i < this.tamanhoRegistros; i++) {
      this.displayedColumns.push('registro' + i);
    }
    this.displayedColumns.push('total', 'descricao', 'acoes');
  }

  getRegistroIndices(): number[] {
    return Array.from({length: this.tamanhoRegistros}, (_, i) => i);
  }


  formataTooltip(registro: RegistroListModel): string {

    if (registro.aprovador) {
      return `Criado por: ${registro.criador} - ${registro.data_criacao}\n
      Aprovado por: ${registro.aprovador} - ${registro.data_aprovacao}`;
    }


    return `Criado por: ${registro.criador} - ${registro.data_criacao}`;
  }

  isNullOrBlank(str: string | null | undefined): boolean {
    return str == null || str.trim() === '';
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
}
