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
import {CheckBoxComponent} from '../../../check-box/check-box.component';

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
    CheckBoxComponent
  ],
  templateUrl: './atualizacao.component.html',
  styleUrls: ['./atualizacao.component.scss']
})
export class AtualizacaoComponent {
  /** Original snapshot of registros for reset */
  private originalRegistros: Registro[] = [];
  /** Working copy of registros being edited */
  registros: Registro[] = [];
  registrosParaApagar: Registro[] = [];
  /** Filter flags */
  showActive: boolean = true;
  showInactive: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public ponto: Ponto,
    private dialogRef: MatDialogRef<AtualizacaoComponent>,
    private registroService: RegistroService
  ) {
    // snapshot registros and create working copy for editing
    this.originalRegistros = ponto.registros.map(r => Object.assign(new Registro(), r));
    this.registros = this.originalRegistros.map(r => Object.assign(new Registro(), r));
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

  remove(index: number): void {
    console.log("remove index:"+index);
    this.registrosParaApagar.push(this.registros[index]);
    this.registros.splice(index, 1);
  }

  save(): void {
    this.registros.forEach(registro => {
      if (registro.id === 0)
        this.registroService.cria(registro, this.ponto.matricula, this.ponto.dia.replaceAll('/', '')).subscribe(
          rr => {
            registro = Registro.toModel(rr)
          }
        )
      else
        this.registroService.atualiza(registro, this.ponto.matricula, this.ponto.dia.replaceAll('/', '')).subscribe(
          rr => {
            registro = Registro.toModel(rr)
          }
        )
    })

    this.registros.forEach((registro, index) => {
      if (!registro.ativo) {
        console.log("save:registros.forEach:index:"+index);
        this.registros.splice(index, 1);
      }
    })

    this.registrosParaApagar.forEach((registro: Registro) => {
      if (registro.id !== 0) {
        this.registroService.apaga(registro.id).subscribe(
          registroApagado => {
            console.log(registroApagado);
          },
        )
      }
    })


    this.dialogRef.close({registros: this.registros});
  }

  /** Restore working copy to original snapshot, clearing pending deletions */
  reset(): void {
    this.registros = this.originalRegistros.map(r => Object.assign(new Registro(), r));
    this.registrosParaApagar = [];
  }

  add(): void {
    let registro = new Registro();
    this.registros.push(registro);
  }

  /** Determine whether a registro should be shown based on filter flags */
  shouldDisplay(reg: Registro): boolean {
    return (reg.ativo && this.showActive) || (!reg.ativo && this.showInactive);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
