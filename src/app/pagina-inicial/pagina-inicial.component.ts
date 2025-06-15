import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {OAuthService} from 'angular-oauth2-oidc';
import {authCodeFlowConfig} from '../auth/auth.code.flow.config';
import {Perfil} from './perfil.model';

@Component({
  standalone: true,
  selector: 'app-pagina-inicial',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './pagina-inicial.component.html',
  styleUrl: './pagina-inicial.component.scss'
})
export class PaginaInicialComponent {

  constructor(
    private authService: AuthService,
    private router: Router,
    private oauthService: OAuthService
  ) {
    console.log("PaginaInicialComponent:constructor")
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        let access_token =this.oauthService.getAccessToken();
        console.log("PaginaInicialComponent:constructor: "+access_token);
        this.handleAuthentication();
      }else{
        console.log("PaginaInicialComponent:constructor: não está logado");
         this.authService.cleanProfile();
      }
    });
    this.oauthService.events.subscribe((e) => {
      if (e.type === 'token_received') {
        this.handleAuthentication();
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  private handleAuthentication(): void {
    // Após login, extrai dados de id_token e access_token
    const idClaims = (this.oauthService.getIdentityClaims() || {}) as Record<string, any>;
    const accessToken = this.oauthService.getAccessToken() || '';
    const accessClaims = accessToken ? this.parseJwt(accessToken) : {};
    // matrícula: prioriza claim 'login', depois 'preferred_username', 'sub'
    const loginAttr = idClaims['login']
      || idClaims['preferred_username']
      || idClaims['sub']
      || accessClaims['sub']
      || '';
    // authorities podem vir em access token ou id token
    const rolesClaim = accessClaims['authorities']
      || idClaims['authorities']
      || idClaims['groups']
      || [];
    const perfil: Perfil = {
      login: loginAttr,
      authorities: Array.isArray(rolesClaim) ? rolesClaim : []
    };
    this.authService.login(perfil).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  /**
   * Decodifica payload de um JWT (access token)
   */
  private parseJwt(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return {};
      }
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
}
