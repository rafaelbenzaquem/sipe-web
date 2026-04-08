import {Component, DestroyRef, inject, signal} from '@angular/core';
import {IMAGE_CONFIG, NgIf, NgOptimizedImage} from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {AuthService} from './auth/auth.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {OAuthService} from 'angular-oauth2-oidc';
import {SessionExpiredDialog} from './auth/session-expired-dialog.component';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import 'moment/locale/pt-br';
import {FlexModule} from '@angular/flex-layout';
import {environment as env} from '../environments/environment';
import {MatMenuModule} from '@angular/material/menu';
import {MatChipsModule} from '@angular/material/chips';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import {MatBadgeModule} from '@angular/material/badge';
import {VersionService} from './core/version.service';
import {NotificacaoService} from './notificacao/notificacao.service';
import {Notificacao} from './notificacao/notificacao.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, NgIf,
    MatButtonModule, MatToolbarModule,
    MatIconModule, MatTableModule,
    MatPaginatorModule, NgOptimizedImage,
    FlexModule, MatMenuModule,
    MatChipsModule, MatSidenavModule,
    MatDividerModule, MatBadgeModule,
    MatDialogModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
    provideMomentDateAdapter(),
    {
      provide: IMAGE_CONFIG,
      useValue: {placeholderResolution: 40}
    },
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SIPE';
  logoPath = 'assets/logoImagem.png';
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  private readonly destroyRef = inject(DestroyRef);

  URL_BASE = env.SIPE_API_URL;
  appVersion = '';

  /** Lista de notificações não lidas, sincronizada com o serviço. */
  notificacoes: Notificacao[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private oauthService: OAuthService,
    private dialog: MatDialog,
    private versionService: VersionService,
    private notificacaoService: NotificacaoService
  ) {
    // Exibe dialog quando o token OAuth estiver prestes a expirar
    this.oauthService.events.subscribe((e) => {
      if (e.type === 'token_expires') {
        const dialogRef = this.dialog.open(SessionExpiredDialog, {disableClose: true});
        dialogRef.afterClosed().subscribe(() => this.authService.logout());
      }
    });

    // Versão da aplicação
    this.versionService.getVersion().subscribe({
      next: (info) => this.appVersion = info.version,
      error: () => this.appVersion = ''
    });

    // Carrega notificações assim que o usuário autentica
    this.authService.usuario$.pipe(
      filter(u => u !== null),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.notificacaoService.carregarNotificacoes(true);
    });

    // Recarrega notificações a cada navegação (respeitando o cache de 5 min)
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.notificacaoService.carregarNotificacoes();
    });

    // Sincroniza a lista local com o observable do serviço
    this.notificacaoService.notificacoes$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(notifs => {
      this.notificacoes = notifs;
    });
  }

  get totalNaoLidas(): number {
    return this.notificacoes.length;
  }

  marcarComoLida(id: string): void {
    this.notificacaoService.marcarComoLida(id);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get perfil() {
    return this.authService.getPerfil();
  }

  get usuario() {
    return this.authService.getUsuario();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  logout(): void {
    this.authService.logout();
  }
}
