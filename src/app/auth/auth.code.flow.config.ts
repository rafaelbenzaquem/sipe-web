import { AuthConfig } from 'angular-oauth2-oidc';
import {environment as env} from '../../environments/environment';

export const authCodeFlowConfig: AuthConfig = {
  issuer: env.SIPE_AUTH_URL,
  redirectUri: env.SIPE_WEB_URL,
  clientId: 'sipe-web',
  loginUrl: env.SIPE_AUTH_URL+'/oauth2/authorize',
  tokenEndpoint: env.SIPE_AUTH_URL+'/oauth2/token',
  userinfoEndpoint: env.SIPE_AUTH_URL+'/oauth2/userinfo',
  logoutUrl: env.SIPE_AUTH_URL+'oauth2/logout',
  silentRefreshRedirectUri: env.SIPE_AUTH_URL+'/oauth2/token',
  timeoutFactor: 0.8,
  requireHttps: false,
  responseType: 'code',
  disablePKCE: false,
  scope: 'openid',
  showDebugInformation: true,
  postLogoutRedirectUri: env.SIPE_WEB_URL,
};
