import {RegistroNovoRequest} from '../../registro/registro.model';

export class Pedido {
  id: number = 0;
  matricula_ponto: string = "";
  dia_ponto: string = "";
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' = 'PENDENTE';
  justificativa: string = "";
  justificativa_aprovador: string = "";
  alteracoes: Alteracao[] = [];

  static toModel(pedidoResponse: PedidoResponse): Pedido {
    let pedido = new Pedido();
    pedido.id = pedidoResponse.id;
    pedido.matricula_ponto = pedidoResponse.matricula_ponto;
    pedido.dia_ponto = pedidoResponse.dia_ponto;
    pedido.status = pedidoResponse.status;
    pedido.justificativa = pedidoResponse.justificativa;
    pedido.justificativa_aprovador = pedidoResponse.justificativa_aprovador;
    pedido.alteracoes = pedidoResponse.alteracoes.map(pr => Alteracao.toModel(pr))
    return pedido;
  }

  toNovoRequest(): PedidoNovoRequest {
    return new PedidoNovoRequest(this.matricula_ponto, this.dia_ponto.replaceAll(':', ''), this.justificativa);
  }
}

export class Alteracao {
  id_registro_original: number = 0;
  id_registro_novo: number = 0;
  acao: 'PENDENTE' | 'APROVADO' | 'REJEITADO' = 'PENDENTE';

  static toModel(alteracaoResponse: AlteracaoResponse) {
    let alteracao = new Alteracao();
    alteracao.id_registro_original = alteracaoResponse.id_registro_original;
    alteracao.id_registro_novo = alteracaoResponse.id_registro_novo;
    alteracao.acao = alteracaoResponse.acao.toUpperCase() as 'PENDENTE' | 'APROVADO' | 'REJEITADO';
    return alteracao;
  }
}


export interface AlteracaoResponse {
  id_registro_original: number,
  id_registro_novo: number,
  acao: string
}

export interface PedidoResponse {
  id: number;
  matricula_ponto: string;
  dia_ponto: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  justificativa: string;
  justificativa_aprovador: string;
  alteracoes: AlteracaoResponse[];
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

export class PedidoAtualizadoRequest {
  id: number = 0;
  matricula_ponto: string = "";
  dia_ponto: string = "";
  justificativa: string = "";
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' = 'PENDENTE';
  justificativa_aprovador: string = "";

  constructor(id: number, matricula_ponto: string, dia_ponto: string, justificativa: string, justificativa_aprovador: string = '', status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' = 'PENDENTE') {
    this.id = id;
    this.matricula_ponto = matricula_ponto;
    this.dia_ponto = dia_ponto;
    this.justificativa = justificativa;
    this.justificativa_aprovador = justificativa_aprovador;
    this.status = status;
  }
}
