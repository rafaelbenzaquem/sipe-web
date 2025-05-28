import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'http://localhost:9000',

  // URL of the SPA to redirect the user to after login
  // redirectUri: window.location.origin + '/pontos/relatorio',
  redirectUri: 'http://localhost:4200/pontos/relatorio',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  // clientId: 'server.code',
  clientId: 'postman-client',

  // Just needed if your auth server demands a secret. In general, this
  // is a sign that the auth server is not configured with SPAs in mind
  // and it might not enforce further best practices vital for security
  // such applications.
  dummyClientSecret: 'secret',

  // Endpoints configurados manualmente:
  loginUrl: 'http://localhost:9000/oauth2/authorize',
  tokenEndpoint: 'http://localhost:9000/oauth2/token',
  userinfoEndpoint: 'http://localhost:9000/oauth2/userinfo',
  logoutUrl: 'http://localhost:9000/oauth2/logout',

  responseType: 'code',

  // set the scope for the permissions the client should request
  // The first four are defined by OIDC.
  // Important: Request offline_access to get a refresh token
  // The api scope is a usecase specific one
  scope: 'openid',

  showDebugInformation: true,
};
