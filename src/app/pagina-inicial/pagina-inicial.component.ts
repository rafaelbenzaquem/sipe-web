import {Component} from '@angular/core';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {OAuthService} from 'angular-oauth2-oidc';
import {authCodeFlowConfig} from '../auth/auth.code.flow.config';
import {AuthService} from '../auth/auth.service';
import {Perfil} from './perfil.model';
import {DashboardUsuarioComponent} from './dashboard-usuario/dashboard-usuario.component';
import {DashboardTabelaComponent} from './dashboard-tabela/dashboard-tabela.component';

@Component({
  standalone: true,
  selector: 'app-pagina-inicial',
  imports: [
    NgIf,
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DashboardUsuarioComponent,
    DashboardTabelaComponent
  ],
  templateUrl: './pagina-inicial.component.html',
  styleUrl: './pagina-inicial.component.scss'
})
export class PaginaInicialComponent {

  get perfil$() { return this.authService.perfil$; }
  get usuario$() { return this.authService.usuario$; }

  constructor(
    private authService: AuthService,
    private oauthService: OAuthService
  ) {
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.handleAuthentication();
      } else {
        this.authService.cleanProfile();
      }
    });
    this.oauthService.events.subscribe((e) => {
      if (e.type === 'token_received') {
        this.handleAuthentication();
      }
    });
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  /** Exibe dashboard individual (usuário comum sem roles privilegiadas). */
  get isUsuarioComum(): boolean {
    return this.authService.hasRole('GRP_SIPE_USERS')
      && !this.authService.hasAnyRole(['GRP_SIPE_ADMIN', 'GRP_SIPE_RH', 'GRP_SIPE_DIRETOR']);
  }

  /** Exibe tabela de setor/global (diretor, admin ou RH). */
  get isDashboardTabela(): boolean {
    return this.authService.hasAnyRole(['GRP_SIPE_ADMIN', 'GRP_SIPE_RH', 'GRP_SIPE_DIRETOR']);
  }

  private handleAuthentication(): void {
    const idClaims = (this.oauthService.getIdentityClaims() || {}) as Record<string, any>;
    const accessToken = this.oauthService.getAccessToken() || '';
    const accessClaims = accessToken ? this.parseJwt(accessToken) : {};

    const loginAttr = idClaims['login']
      || idClaims['preferred_username']
      || idClaims['sub']
      || accessClaims['sub']
      || '';

    const rolesClaim = accessClaims['authorities']
      || idClaims['authorities']
      || idClaims['groups']
      || [];

    const perfil: Perfil = {
      login: loginAttr,
      authorities: Array.isArray(rolesClaim) ? rolesClaim : []
    };

    // Atualiza o estado de autenticação; o template reage via async pipe
    this.authService.login(perfil).subscribe();
  }

  /** Decodifica payload de um JWT (access token). */
  private parseJwt(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return {};
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  }
}
