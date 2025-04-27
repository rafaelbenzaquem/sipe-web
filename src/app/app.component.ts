import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
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

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink,
    MatButtonModule, MatToolbarModule,
    MatIconModule, MatTableModule,
    MatPaginatorModule,
    NgOptimizedImage, FlexModule],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
    provideMomentDateAdapter(),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        placeholderResolution: 40
      }
    }
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SIPE';
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));

  URL_BASE = env.SIPE_API_URL;
}
