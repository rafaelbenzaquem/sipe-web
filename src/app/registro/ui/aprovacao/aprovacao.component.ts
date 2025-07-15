import {Component, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexModule} from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Registro} from '../../registro.model';
import {Ponto} from '../../../ponto/ponto.model';
import {RegistroService} from '../../registro.service';

interface AprovacaoRow {
  before: Registro;
  after: Registro;
}

@Component({
  standalone: true,
  selector: 'app-aprovacao',
  imports: [
    CommonModule,
    FlexModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './aprovacao.component.html',
  styleUrls: ['./aprovacao.component.scss']
})
export class AprovacaoComponent {
  rows: AprovacaoRow[] = [];
  displayedColumns: string[] = ['sentido', 'hora', 'ativo', 'codigo_acesso'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public ponto: Ponto,
    private dialogRef: MatDialogRef<AprovacaoComponent>,
    private registroService: RegistroService
  ) {
    this.createRows();
  }

  private createRows(): void {
    const groupMap = new Map<number, Registro[]>();
    this.ponto.registros.forEach(reg => {
      const key = reg.novoRegistro != null ? reg.novoRegistro : reg.id;
      const list = groupMap.get(key) ?? [];
      list.push(reg);
      groupMap.set(key, list);
    });
    groupMap.forEach(group => {
      const after = group.find(r => r.novoRegistro == null) || group[0];
      const before = group.find(r => r.novoRegistro != null) || group[0];
      this.rows.push({ before, after });
    });
  }

  aprovar(): void {
    const pending = this.rows
      .map(r => r.after)
      .filter(r => r.matricula_aprovador === 'Não aprovado');
    pending.forEach(reg => this.registroService.aprova(reg.id).subscribe());
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}