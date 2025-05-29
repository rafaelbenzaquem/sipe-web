import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { UnauthorizedComponent } from './error/unauthorized.component';
import { ConsultaComponent as UsuarioConsultaComponent } from './usuario/ui/consulta/consulta.component';
import { CadastroComponent as CadastroUsuarioComponent } from './usuario/ui/cadastro/cadastro.component';
import { RelatorioPontosComponent } from './ponto/ui/relatorio-pontos/relatorio-pontos.component';
import { PaginaInicialComponent } from './pagina-inicial/pagina-inicial.component';


export const routes: Routes = [
  { path: '', component: PaginaInicialComponent },
  {
    path: 'usuarios/consulta',
    component: UsuarioConsultaComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_DIRETOR', 'GRP_SIPE_RH'] }
  },
  {
    path: 'usuarios/cadastro',
    component: CadastroUsuarioComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_RH'] }
  },
  {
    path: 'pontos/relatorio',
    component: RelatorioPontosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_DIRETOR', 'GRP_SIPE_USERS'] }
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '' }
];
