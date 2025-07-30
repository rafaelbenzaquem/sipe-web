import {RegistroNovoRequest} from '../../registro/registro.model';

export class Pedido {
  id: number = 0;
  matricula_ponto: string = "";
  dia_ponto: string = "";
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' = 'PENDENTE';
  justificativa: string = "";

  static toModel(pedidoResponse: PedidoResponse): Pedido {
    let pedido = new Pedido();
    pedido.id = pedidoResponse.id;
    pedido.matricula_ponto = pedidoResponse.matricula_ponto;
    pedido.dia_ponto = pedidoResponse.dia_ponto;
    pedido.status = pedidoResponse.status;
    pedido.justificativa = pedidoResponse.justificativa;
    return pedido;
  }

  toNovoRequest(): PedidoNovoRequest {
    return new PedidoNovoRequest(this.matricula_ponto, this.dia_ponto.replaceAll(':', ''), this.justificativa);
  }
}


export interface PedidoResponse {
  id: number;
  matricula_ponto: string;
  dia_ponto: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  justificativa: string;
}

export class PedidoNovoRequest {
  matricula_ponto: string = "";
  dia_ponto: string = "";
  justificativa: string = "";

  constructor(matricula_ponto: string, dia_ponto: string, justificativa: string) {
    this.matricula_ponto = matricula_ponto;
    this.dia_ponto = dia_ponto;
    this.justificativa = justificativa;
  }
}
