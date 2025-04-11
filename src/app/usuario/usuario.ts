export class Usuario {

  id?: number;
  nome?: string;
  matricula?: string;
  cracha?: string;
  horas_diaria?: number;

  static novoUsuario(){
    return new Usuario();
  }

}
