import {Usuario} from '../usuario/usuario.model';

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  icone: string;
  tipo: 'PENDENTE' | 'AVALIADO';
  usuario: Usuario;
  routerLink: string[];
  routerState: {usuario: Usuario};
}
