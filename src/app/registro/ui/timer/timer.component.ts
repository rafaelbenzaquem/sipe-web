import {Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common'
import {MatTooltipModule} from '@angular/material/tooltip';
import {RegistroListModel} from '../../../ponto/ui/tabela-pontos/tabela-pontos.component';

@Component({
  selector: 'app-timer',
  imports: [MatTooltipModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
  providers: [DatePipe]
})
export class TimerComponent {

  private _registro: RegistroListModel = new RegistroListModel();

  @Input()
  set registro(registro: RegistroListModel) {
    this._registro = registro || null;
  }

  get registro(): RegistroListModel {
    return this._registro;
  }

  mensagemTooltip(): string {

    if (this._registro.aprovador) {
      return `Criado por: ${this._registro.criador} - ${this._registro.data_criacao}\n
      Aprovado por: ${this._registro.aprovador} - ${this._registro.data_aprovacao}`;
    }

    return `Criado por: ${this._registro.criador} - ${this._registro.data_criacao}`;
  }

  isNullOrBlank(str: string | null | undefined): boolean {
    return str == null || str.trim() === '';
  }
}
