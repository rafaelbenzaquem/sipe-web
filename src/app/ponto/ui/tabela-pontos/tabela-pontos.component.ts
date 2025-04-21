import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DatePipe, NgForOf} from '@angular/common';
import {Ponto} from '../../ponto.model';
import {FormsModule} from '@angular/forms';
import {Registro} from '../../../registro/registro.model';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';


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
    MatIconModule
  ],
  templateUrl: './tabela-pontos.component.html',
  styleUrl: './tabela-pontos.component.scss',
  providers: [DatePipe]
})
export class TabelaPontosComponent implements OnChanges, OnInit {


  @Input() pontos: Ponto[] = [];
  @Input() tamanhoRegistros = 2;
  pontosTableModel: PontoTableModel[] = [];


  ngOnChanges(changes: SimpleChanges): void {
    console.log("TabelaPontosComponent ngOnChanges... ponto.length " + this.pontos.length);
    console.log("TabelaPontosComponent ngOnChanges... tamanhoRegistros " + this.tamanhoRegistros);
    if (changes['pontos']) {
      this.pontosTableModel = this.criaPontosTableModel(this.pontos, this.tamanhoRegistros);
    }
  }

  ngOnInit(): void {
    console.log("TabelaPontosComponent ngOnInit... ponto.length " + this.pontos.length);
    console.log("TabelaPontosComponent ngOnInit... tamanhoRegistros " + this.tamanhoRegistros);
    this.pontosTableModel = this.criaPontosTableModel(this.pontos, this.tamanhoRegistros);
  }

  // constructor() {
  //   console.log("TabelaPontosComponent constructor... ponto.length"+ this.pontos.length);
  //   this.pontosTableModel = this.criaPontosTableModel(this.pontos);
  //   this.tamanhoRegistros = this.verificaMaiorListaDeRegistro(this.pontos) + 1;
  //
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
}
