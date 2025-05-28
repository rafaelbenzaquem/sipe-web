import {Component} from '@angular/core';
import {CommonModule, NgIf, NgFor} from '@angular/common';
import {FormControl, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {Perfil} from './perfil.model';
import {OAuthService} from 'angular-oauth2-oidc';
import {authCodeFlowConfig} from '../auth/auth.code.flow.config';

@Component({
  standalone: true,
  selector: 'app-pagina-inicial',
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './pagina-inicial.component.html',
  styleUrl: './pagina-inicial.component.scss'
})
export class PaginaInicialComponent {
  loginForm = new FormGroup({
    matricula: new FormControl('', Validators.required),
    authorities: new FormControl<string[]>([], Validators.required)
  });

  grupos: string[] = [
    'GRP_SIPE_USERS',
    'GRP_SIPE_ADMIN',
    'GRP_SIPE_DIRETOR',
    'GRP_SIPE_RH'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private oauthService: OAuthService,
  ) {

    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();

    let token = this.oauthService.getAccessToken()

    console.log('token', token);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const perfil: Perfil = {
      login: this.loginForm.value.matricula || "",
      authorities: this.loginForm.value.authorities || []
    };
    this.authService.login(perfil).subscribe(usuario => {
      console.log(usuario);
      this.router.navigate(['/pontos/relatorio'], {state: {usuario}});
    });
  }

  login(): void {
    var claims = this.oauthService.getIdentityClaims();
    console.log(claims);
    if (claims==null) {
      console.log("Entrado no fluxo de autenticação");
      this.oauthService.initImplicitFlow();
    }
  }
}
