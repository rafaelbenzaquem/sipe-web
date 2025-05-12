import {Routes} from '@angular/router';
import {ConsultaComponent as UsuarioConsultaComponent} from './usuario/ui/consulta/consulta.component';
import {CadastroComponent as CadastroUsuarioComponent} from './usuario/ui/cadastro/cadastro.component';
import {RelatorioPontosComponent} from './ponto/ui/relatorio-pontos/relatorio-pontos.component';
import {OAuthCallbackComponent} from './oauth2/oauth-callback.component';


export const routes: Routes = [
  {path: 'usuarios/consulta', component: UsuarioConsultaComponent},
  {path: 'usuarios/cadastro', component: CadastroUsuarioComponent},
  {path: 'pontos/relatorio', component: RelatorioPontosComponent},
  { path: 'login/oauth2/code/angular-client', component: OAuthCallbackComponent }
];
