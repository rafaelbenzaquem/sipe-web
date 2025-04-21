export class Registro {
  id: number = 0;
  hora: string = '';
  sentido: 'Entrada' | 'Saída' | '-----' = '-----';
  codigo_acesso: number = 0;
  versao: number = 0;


  static toModel(registroResponse: RegistroResponse) {
    let registro = new Registro();
    registro.id = registroResponse.id;
    registro.hora = registroResponse.hora;
    registro.sentido = registroResponse.sentido;
    registro.codigo_acesso = registroResponse.codigo_acesso;
    registro.versao = registroResponse.versao;
    return registro;
  }


}

export interface RegistroResponse {
  id: number;
  hora: string;
  sentido: 'Entrada' | 'Saída';
  codigo_acesso: number;
  versao: number;
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
