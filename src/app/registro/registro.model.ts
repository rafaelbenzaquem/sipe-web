export class Registro {

  id: number = 0;
  hora: string = '';
  sentido: 'Entrada' | 'Saída' | '-----' = '-----';
  ativo: boolean = true;
  codigo_acesso: number = 0;

  static toModel(registroResponse: RegistroResponse) {
    let registro = new Registro();
    registro.id = registroResponse.id;
    registro.hora = registroResponse.hora;
    registro.sentido = registroResponse.sentido;
    registro.codigo_acesso = registroResponse.codigo_acesso;
    registro.ativo = registroResponse.ativo;
    return registro;
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
