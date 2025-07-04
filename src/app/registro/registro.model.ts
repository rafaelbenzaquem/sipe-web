export class Registro {

  id: number = 0;
  hora: string = '';
  sentido: 'Entrada' | 'Saída' | '-----' = '-----';
  ativo: boolean = true;
  codigo_acesso: number = 0;
  matricula_aprovador: string = 'Não aprovado';
  data_aprovacao: string = 'Não aprovado';
  data_criacao: string = '';
  matricula_criador: string = '';

  static toModel(registroResponse: RegistroResponse) {
    let registro = new Registro();
    registro.id = registroResponse.id;
    registro.hora = registroResponse.hora;
    registro.sentido = registroResponse.sentido;
    registro.codigo_acesso = registroResponse.codigo_acesso;
    registro.ativo = registroResponse.ativo;
    registro.matricula_aprovador = registroResponse.matricula_aprovador;
    registro.data_aprovacao = registroResponse.data_aprovacao;
    registro.data_criacao = registroResponse.data_criacao;
    registro.matricula_criador = registroResponse.matricula_criador;
    return registro;
  }

   registroFoiAlterado(novo: Registro): boolean {
    if (this.id !== novo.id) {
      throw new Error('Registros com IDs diferentes não devem ser comparados.');
    }

    return this.hora !== novo.hora ||
      this.sentido !== novo.sentido ||
      this.ativo !== novo.ativo ||
      this.codigo_acesso !== novo.codigo_acesso;
  }

  existeNaLista(registros: Registro[]): boolean {
    return registros.some(registro => registro.id === this.id);
  }

  toNovoRequest(): RegistroNovoRequest {
    return new RegistroNovoRequest(
      this.hora.replaceAll(':',''),
      this.sentido,
      this.ativo,
      this.codigo_acesso
    );
  }

  toAtualizadoRequest(): RegistroAtualizadoRequest {
    return new RegistroAtualizadoRequest(
      this.id,
      this.hora.replaceAll(':',''),
      this.sentido,
      this.ativo,
      this.codigo_acesso
    );
  }
}

export class RegistroAtualizadoRequest {
  id?: number;
  hora?: string;
  sentido?: string;
  ativo?: boolean;
  codigo_acesso?: number;

  constructor(id: number, hora: string, sentido: string, ativo: boolean, codigo_acesso: number) {
    this.id = id;
    this.hora = hora;
    this.sentido = sentido;
    this.ativo = ativo;
    this.codigo_acesso = codigo_acesso;
  }
}

export class RegistroNovoRequest {
  hora?: string;
  sentido?: string;
  ativo?: boolean;
  codigo_acesso?: number;

  constructor(hora: string, sentido: string, ativo: boolean, codigo_acesso: number) {
    this.hora = hora;
    this.sentido = sentido;
    this.ativo = ativo;
    this.codigo_acesso = codigo_acesso;
  }
}

export interface RegistroResponse {
  id: number;
  hora: string;
  sentido: 'Entrada' | 'Saída';
  codigo_acesso: number;
  matricula_aprovador: string;
  data_aprovacao: string;
  data_criacao: string;
  matricula_criador: string;
  ativo: boolean;
  _links: {
    self: {
      href: string;
    };
  };
}

export interface EmbeddedRegistros {
  registros: RegistroResponse[];
}

export interface RegistroListResponse {
  _embedded: EmbeddedRegistros;
  _links: {
    self: {
      href: string;
    };
  };
}
