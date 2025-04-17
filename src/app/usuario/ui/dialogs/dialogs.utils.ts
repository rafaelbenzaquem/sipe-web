import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Usuario} from '../../usuario.model';
import {AtualizacaoComponent} from '../atualizacao/atualizacao.component';


@Component({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,

  ],
  template:
    `
      <h2 mat-dialog-title > Usuario Cadastrado com Sucesso!</h2>
      <mat-dialog-content>
        {{ 'ID: ' + usuario.id }}<br/>
        {{ 'Nome: ' + usuario.nome }}<br/>
        {{ 'Matrícula: ' + usuario.matricula }}<br/>
        {{ 'Crachá Ponto: ' + usuario.cracha }}<br/>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-flat-button color="accent" (click)="onNoClick()">Fechar</button>
        <button mat-flat-button color="primary">Atualizar</button>
      </mat-dialog-actions>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensagemSucessoDialog {
  readonly dialogRef = inject(MatDialogRef<MensagemSucessoDialog>);
  readonly usuario = inject<Usuario>(MAT_DIALOG_DATA);

  onNoClick() {
    this.dialogRef.close();
  }
}

@Component({
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title> Erro ao Cadastrar o usuário!</h2>
    <mat-dialog-content>Por favor, verifique as mensagem de erro e tente novamente.</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensagemErroDialog {
}


@Component({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    AtualizacaoComponent,

  ],
  template:
    `
      <app-atualizacao [usuario]="usuario" title="Atualização Usuário(id:{{usuario.id}})"></app-atualizacao>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtualizacaoUsuarioDialog {
  readonly usuario = inject<Usuario>(MAT_DIALOG_DATA);

}
