import {Routes} from '@angular/router';
import {AuthGuard} from './auth/auth.guard';
import {RoleGuard} from './auth/role.guard';
import {UnauthorizedComponent} from './error/unauthorized.component';
import {ConsultaComponent as UsuarioConsultaComponent} from './usuario/ui/consulta/consulta.component';
import {CadastroComponent as CadastroUsuarioComponent} from './usuario/ui/cadastro/cadastro.component';
import {RelatorioPontosComponent} from './ponto/ui/relatorio-pontos/relatorio-pontos.component';
import {PaginaInicialComponent} from './pagina-inicial/pagina-inicial.component';
import {
  RelatorioPontosPendentesComponent
} from './ponto/ui/relatorio-pontos-pendentes/relatorio-pontos-pendentes.component';
import {FrequenciaComponent} from './usuario/ui/frequencia/frequencia.component';


export const routes: Routes = [
  {path: '', component: PaginaInicialComponent},
  {
    path: 'usuarios/frequencia',
    component: FrequenciaComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_DIRETOR', 'GRP_SIPE_RH']}
  },
  {
    path: 'usuarios/consulta',
    component: UsuarioConsultaComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_DIRETOR', 'GRP_SIPE_RH']}
  },
  {
    path: 'usuarios/cadastro',
    component: CadastroUsuarioComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_RH']}
  },
  {
    path: 'pontos/relatorio',
    component: RelatorioPontosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_DIRETOR', 'GRP_SIPE_USERS']}
  },
  {
    path: 'pontos/relatorio/pendente',
    component: RelatorioPontosPendentesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['GRP_SIPE_ADMIN', 'GRP_SIPE_DIRETOR', 'GRP_SIPE_USERS']}
  },
  {path: 'unauthorized', component: UnauthorizedComponent},
  {path: '**', redirectTo: '/'}
];
