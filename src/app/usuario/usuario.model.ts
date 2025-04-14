export class Usuario {

  id?: number;
  nome?: string;
  matricula?: string;
  cracha?: string;
  hora_diaria?: number;

  static toModel(usuario: UsuarioResponse) {
    let usuarioModel = new Usuario();
    usuarioModel.id = usuario.id;
    usuarioModel.nome = usuario.nome;
    usuarioModel.matricula = usuario.matricula;
    usuarioModel.cracha = usuario.cracha;
    usuarioModel.hora_diaria = usuario.hora_diaria;
    return usuarioModel;
  }

  toRequest() {
    const usuarioCreteRequest: UsuarioCreateRequest = {
      cracha: this.cracha === undefined ? "" : this.cracha,
      hora_diaria: this.hora_diaria === undefined ? 7 : this.hora_diaria,
      matricula: this.matricula === undefined ? "" : this.matricula,
      nome: this.nome === undefined ? "" : this.nome,
    };
    return usuarioCreteRequest;
  }

}

export interface UsuarioResponse {
  id: number;
  nome: string;
  matricula: string;
  cracha: string;
  hora_diaria: number;
  _links: {
    self: { href: string };
    delete: { href: string };
  };
}


export interface EmbeddedUsuarios {
  usuarios: UsuarioResponse[];
}

export interface UsuarioListResponse {
  _embedded: EmbeddedUsuarios;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface UsuarioCreateRequest {
  nome: string;
  matricula: string;
  cracha: string;
  hora_diaria: number;
}
