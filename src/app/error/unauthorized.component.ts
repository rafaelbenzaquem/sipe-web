import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-unauthorized',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Acesso Negado</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Você não tem permissão para acessar esta página.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" routerLink="/">Voltar ao Login</button>
      </mat-card-actions>
    </mat-card>
  `
})
export class UnauthorizedComponent {}