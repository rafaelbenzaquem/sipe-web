import {Component, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexModule} from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RegistroResponse} from '../../registro.model';
import {RegistroService} from '../../registro.service';
import {Pedido} from '../../../alteracao/pedido/pedido.model';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {PedidoService} from '../../../alteracao/pedido/pedido.service';

interface AprovacaoRow {
  before: RegistroModel;
  after: RegistroModel;
}

export class RegistroModel {
  id: number = 0;
  hora: string = '--:--';
  sentido: 'Entrada' | 'Saída' | '-----' = '-----';
  ativo: boolean = false;
  codigo_acesso: number = 0;
  matricula_aprovador: string = 'Não aprovado';
  data_aprovacao: string = 'Não aprovado';


  static of(registro: RegistroResponse): RegistroModel {
    let rm = new RegistroModel();
    rm.id = registro.id;
    rm.hora = registro.hora;
    rm.sentido = registro.sentido;
    rm.ativo = registro.ativo;
    rm.codigo_acesso = registro.codigo_acesso;
    rm.matricula_aprovador = registro.matricula_aprovador;
    rm.data_aprovacao = registro.data_aprovacao;

    return rm;
  }

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
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './controle-aprovacao.component.html',
  styleUrl: './controle-aprovacao.component.scss'
})

export class ControleAprovacaoComponent {
  ponto: Pedido = new Pedido();
  rows: AprovacaoRow[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public pedido: Pedido,
    private dialogRef: MatDialogRef<ControleAprovacaoComponent>,
    private registroService: RegistroService,
    private pedidoService: PedidoService
  ) {
    this.createRows();
  }

  private createRows(): void {

    console.log("Alterações size: " + this.pedido.alteracoes.length);
    this.pedido.alteracoes.forEach(al => {
      let before = new RegistroModel();
      let after = new RegistroModel();
      console.log("Iterando em alterações: " + JSON.stringify(al));
      if (al.id_registro_original == null && al.id_registro_novo == null) {

      } else if (al.id_registro_novo == null) {
        this.registroService.busca(al.id_registro_original).subscribe(ro => {
          before = RegistroModel.of(ro);
          console.log("before: " + JSON.stringify(before));
          console.log("after: " + JSON.stringify(after));
          this.rows.push({before, after});
        });

      } else if (al.id_registro_original == null) {
        this.registroService.busca(al.id_registro_novo).subscribe(rn => {
          after = RegistroModel.of(rn);
          console.log("before: " + JSON.stringify(before));
          console.log("after: " + JSON.stringify(after));
          this.rows.push({before, after});
        });
      } else {
        this.registroService.busca(al.id_registro_original).subscribe(ro => {
          this.registroService.busca(al.id_registro_novo).subscribe(rn => {
            console.log("registro original: " + JSON.stringify(ro));
            console.log("registro novo: " + JSON.stringify(rn));
            before = RegistroModel.of(ro);
            after = RegistroModel.of(rn);
            console.log("before: " + JSON.stringify(before));
            console.log("after: " + JSON.stringify(after));
            this.rows.push({before, after});
          })
        })
      }
    });
  }

  aprovar(): void {
    this.pedidoService.aprovaPedido(this.pedido.id, this.pedido.matricula_ponto,
      this.converterData(this.pedido.dia_ponto), this.pedido.justificativa,
      this.pedido.justificativa_aprovador).subscribe(
      pr => {
        let pedido: Pedido = Pedido.toModel(pr);
        console.log("AprovacaoComponent::aprovar");
        this.dialogRef.close({pedido: Pedido});
      }
    );
  }

  rejeitar(): void {
    this.pedidoService.aprovaPedido(this.pedido.id, this.pedido.matricula_ponto,
      this.converterData(this.pedido.dia_ponto), this.pedido.justificativa,
      this.pedido.justificativa_aprovador).subscribe(
      pr => {
        let pedido: Pedido = Pedido.toModel(pr);
        console.log("AprovacaoComponent::rejeitar");
        this.dialogRef.close({pedido: Pedido});
      }
    );
  }

  converterData(dataISO: string): string {
    // dataISO esperado: "2025-08-15"
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}${mes}${ano}`;
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
