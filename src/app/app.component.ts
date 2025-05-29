import {Component, inject, signal} from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import 'moment/locale/pt-br'
import {IMAGE_CONFIG, NgOptimizedImage} from '@angular/common';
import {FlexModule} from '@angular/flex-layout';
import {environment as env} from '../environments/environment';
import {MatMenuModule} from '@angular/material/menu';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, NgIf,
    MatButtonModule, MatToolbarModule,
    MatIconModule, MatTableModule,
    MatPaginatorModule,
    NgOptimizedImage, FlexModule, MatMenuModule, MatChipsModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
    provideMomentDateAdapter(),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        placeholderResolution: 40
      }
    },
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SIPE';
  logoPath = 'assets/logoImagem.png';
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));

  URL_BASE = env.SIPE_API_URL;
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Retorna o perfil do usuário logado
   */
  get perfil() {
    return this.authService.getPerfil();
  }

  get usuario(){
    return this.authService.getUsuario();
  }

  /**
   * Verifica se possui determinada permissão
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Verifica se possui ao menos uma das permissões
   */
  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  /**
   * Inicia logout federado:
   * - Limpa estado local e redireciona ao Identity Provider para encerrar sessão
   * - Após logout no provedor, o usuário retorna à aplicação em postLogoutRedirectUri
   */
  logout(): void {
    this.authService.logout();
  }
}
