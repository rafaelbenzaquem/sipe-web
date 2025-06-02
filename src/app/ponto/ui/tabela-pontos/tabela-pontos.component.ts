import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatePipe, NgForOf} from '@angular/common';
import {Ponto} from '../../ponto.model';
import {FormsModule} from '@angular/forms';
import {Registro} from '../../../registro/registro.model';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';


export class PontoTableModel {

  dia: string = '';
  descricao: string = '';
  total: string = '00:00:00';
  registros: RegistroListModel[] = [];
  ponto: Ponto = new Ponto();

  static toPontoTableModel(ponto: Ponto): PontoTableModel {
    let pontoTableModel = new PontoTableModel();
    pontoTableModel.dia = ponto.dia;
    pontoTableModel.descricao = ponto.descricao;
    pontoTableModel.total = PontoTableModel.formatarSegundosEmHoras(ponto.total_segundos);
    pontoTableModel.registros = ponto.registros.map(RegistroListModel.toRegistroListModel);
    pontoTableModel.ponto = ponto;
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

}

export class RegistroListModel {
  sentido: string = '-----';
  hora: string = '--:--';
  registro: Registro = new Registro();


  static toRegistroListModel(registro: Registro) {
    let registroListModel = new RegistroListModel();
    registroListModel.sentido = registro.sentido;
    registroListModel.hora = registro.hora;
    registroListModel.registro = registro;
    return registroListModel;
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
    MatTableModule
  ],
  templateUrl: './tabela-pontos.component.html',
  styleUrl: './tabela-pontos.component.scss',
  providers: [DatePipe]
})
export class TabelaPontosComponent {


  private _pontos: Ponto[] = [];
  /** Pontos de entrada; reconstrói o modelo da tabela quando alterar */
  @Input()
  set pontos(v: Ponto[]) {
    this._pontos = v || [];
    this.updateTableModel();
  }
  get pontos(): Ponto[] {
    return this._pontos;
  }
  @Output() editar = new EventEmitter<Ponto>();
  private _tamanhoRegistros = 2;
  /** Número de colunas de registros; reconstrói o modelo da tabela quando alterar */
  @Input()
  set tamanhoRegistros(v: number) {
    this._tamanhoRegistros = v || 0;
    this.updateTableModel();
  }
  get tamanhoRegistros(): number {
    return this._tamanhoRegistros;
  }
  pontosTableModel: PontoTableModel[] = [];


  // /** Reconstrói o modelo de exibição a partir dos inputs atuais */
  // private updateTableModel(): void {
  //   this.pontosTableModel = this.criaPontosTableModel(this._pontos, this._tamanhoRegistros);
  // }


  criaPontosTableModel(pontos: Ponto[], maiorLista: number) {
    // let maiorLista = this.verificaMaiorListaDeRegistro(pontos);
    let pontosTableModel: PontoTableModel[] = [];
    pontosTableModel = pontos.map(PontoTableModel.toPontoTableModel)
    pontosTableModel.forEach(ponto => {
      if (ponto.registros) {

        let elementosFaltantes = maiorLista - ponto.registros.length;

        for (let i = 0; i < elementosFaltantes; i++) {
          ponto.registros.push(new RegistroListModel());
        }
      }
    })
    return pontosTableModel;
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
    return Array.from({ length: this.tamanhoRegistros }, (_, i) => i);
  }


}
