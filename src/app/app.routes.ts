import {Routes} from '@angular/router';
import {ConsultaComponent as UsuarioConsultaComponent} from './usuario/ui/consulta/consulta.component';
import {CadastroComponent as CadastroUsuarioComponent} from './usuario/ui/cadastro/cadastro.component';


export const routes: Routes = [
  {path: 'usuarios/consulta', component: UsuarioConsultaComponent},
  {path: 'usuarios/cadastro', component: CadastroUsuarioComponent}
];
