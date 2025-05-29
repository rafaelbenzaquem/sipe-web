import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const roles = route.data['roles'] as string[];
    if (!this.authService.isLoggedIn()) {
      return this.router.parseUrl('/');
    }
    if (this.authService.hasAnyRole(roles)) {
      return true;
    }
    // Acesso negado se não possuir role
    return this.router.parseUrl('/unauthorized');
  }
}