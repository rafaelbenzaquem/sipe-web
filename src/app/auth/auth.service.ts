import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Perfil } from '../pagina-inicial/perfil.model';
import { Usuario } from '../usuario/usuario.model';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private perfilSubject = new BehaviorSubject<Perfil | null>(null);
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  perfil$ = this.perfilSubject.asObservable();
  usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  /**
   * Simula login definindo perfil e buscando dados do usuário.
   */
  login(perfil: Perfil): Observable<Usuario> {
    this.perfilSubject.next(perfil);
    return this.usuarioService.getUsuarios(0, 1, '', perfil.login).pipe(
      map(response => {
        const usuario = Usuario.toModel(response._embedded.usuarios[0]);
        this.usuarioSubject.next(usuario);
        return usuario;
      })
    );
  }

  /**
   * Logout limpa perfil e navega para página de login.
   */
  logout(): void {
    this.perfilSubject.next(null);
    this.usuarioSubject.next(null);
    this.router.navigate(['/']);
  }

  /**
   * Indica se há usuário logado.
   */
  isLoggedIn(): boolean {
    return !!this.perfilSubject.value;
  }

  /**
   * Retorna perfil atual.
   */
  getPerfil(): Perfil | null {
    return this.perfilSubject.value;
  }

  /**
   * Retorna dados do usuário logado.
   */
  getUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  /**
   * Verifica se possui determinada role.
   */
  hasRole(role: string): boolean {
    return this.perfilSubject.value?.authorities.includes(role) ?? false;
  }

  /**
   * Verifica se possui ao menos uma das roles fornecidas.
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }
}