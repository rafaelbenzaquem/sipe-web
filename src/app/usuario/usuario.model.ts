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

  toCreateRequest() {
    const usuarioCreteRequest: UsuarioCreateRequest = {
      cracha: this.cracha || "",
      hora_diaria: this.hora_diaria || 7,
      matricula: this.matricula || "",
      nome: this.nome || ""
    };
    return usuarioCreteRequest;
  }

  toUpdateRequest() {
    const usuarioUpdateRequest: UsuarioUpdateRequest = {
      id: this.id || 0,
      cracha: this.cracha || "",
      hora_diaria: this.hora_diaria || 7,
      matricula: this.matricula || "",
      nome: this.nome || ""
    };
    return usuarioUpdateRequest;
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

export interface UsuarioUpdateRequest {
  id: number;
  nome: string;
  matricula: string;
  cracha: string;
  hora_diaria: number;
}
