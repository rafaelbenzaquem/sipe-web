import {Component, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {FlexLayoutModule, FlexModule} from '@angular/flex-layout';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Registro} from '../../registro.model';
import {Ponto} from '../../../ponto/ponto.model';
import {MatCard, MatCardModule} from '@angular/material/card';
import {RegistroService} from '../../registro.service';

@Component({
  standalone: true,
  selector: 'app-atualizacao',
  imports: [
    CommonModule,
    FlexModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCard,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatCardModule,
  ],
  templateUrl: './atualizacao.component.html',
  styleUrls: ['./atualizacao.component.scss']
})
export class AtualizacaoComponent {
  registros: Registro[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ponto,
    private dialogRef: MatDialogRef<AtualizacaoComponent>,
    private registroService: RegistroService
  ) {
    // duplicar para edição sem afetar o original até salvar
    this.registros = data.registros;
  }

  moveUp(index: number): void {
    if (index > 0) {
      [this.registros[index - 1], this.registros[index]] = [this.registros[index], this.registros[index - 1]];
    }
  }

  moveDown(index: number): void {
    if (index < this.registros.length - 1) {
      [this.registros[index + 1], this.registros[index]] = [this.registros[index], this.registros[index + 1]];
    }
  }

  ativar(index: number): void {
    var registro = this.registros[index];
    if (registro) {
      registro.ativo = true
    }
  }

  desativar(index: number): void {
    var registro = this.registros[index];
    if (registro) {
      registro.ativo = false
    }
  }

  remove(index: number): void {
    this.registros.splice(index, 1);
  }

  save(): void {
    this.registros.forEach(registro => {
      if (registro.id === 0)
        this.registroService.cria(registro, this.data.matricula, this.data.dia.replaceAll('/','')).subscribe(
          rr => {
            registro = Registro.toModel(rr)
          }
        )
      else
        this.registroService.atualiza(registro, this.data.matricula, this.data.dia.replaceAll('/','')).subscribe(
          rr => {
            registro = Registro.toModel(rr)
          }
        )
    })

    this.dialogRef.close({registros: this.registros});
  }

  add(): void {
    let registro = new Registro();
    this.registros.push(registro);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
