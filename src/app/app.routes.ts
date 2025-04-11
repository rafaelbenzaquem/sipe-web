import { Routes } from '@angular/router';
import {CadastroUsuarioComponent} from './cadastro-usuario/cadastro-usuario.component';
import {ConsultaUsuarioComponent} from './consulta-usuario/consulta-usuario.component';

export const routes: Routes = [
  {path: 'usuarios/consulta', component: ConsultaUsuarioComponent},
  {path: 'usuarios/cadastro', component: CadastroUsuarioComponent},
];
