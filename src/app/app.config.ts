import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './auth/auth.code.flow.config';
import { environment } from '../environments/environment';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    provideOAuthClient({
      resourceServer: {
        allowedUrls: [environment.SIPE_API_URL],
        sendAccessToken: true
      }
    })
  ]
};
