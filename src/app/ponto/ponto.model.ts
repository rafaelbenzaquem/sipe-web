import {Registro} from '../registro/registro.model';

export class Ponto {

  matricula: string = '';
  dia: string = '';
  descricao: string = '';
  indice: number = 0;
  total_segundos: number = 0;
  pedidoAlteracaoPendente: boolean = false;
  pedidoAlteracaoAtualAvaliado: boolean = false;
  registros: Registro[] = [];

  static toModel(pontoResponse: PontoResponse) {
    let ponto = new Ponto();
    ponto.matricula = pontoResponse.matricula;
    ponto.dia = pontoResponse.dia;
    ponto.descricao = pontoResponse.descricao;
    ponto.indice = pontoResponse.indice;
    ponto.total_segundos = pontoResponse.total_segundos;
    ponto.pedidoAlteracaoPendente = pontoResponse.pedido_alteracao_pendente;
    ponto.pedidoAlteracaoAtualAvaliado = pontoResponse.pedido_alteracao_atual_avaliado;
    return ponto;
  }
}


export interface EmbeddedPontosResponse {
  pontos: PontoResponse[];
}


export interface PontoResponse {
  matricula: string;
  dia: string;
  descricao: string;
  indice: number;
  total_segundos: number;
  pedido_alteracao_pendente: boolean;
  pedido_alteracao_atual_avaliado: boolean;
  _links: {
    self: { href: string };
    registros: { href: string };
  };
}


export interface EmbeddedUsuarios {
  usuarios: PontoResponse[];
}

export interface PontoListResponse {
  _embedded: EmbeddedPontosResponse;
  _links: {
    self: { href: string };
  };
}
