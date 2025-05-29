import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'http://localhost:9000',

  // URL of the SPA to redirect the user to after login
  // redirectUri: window.location.origin + '/pontos/relatorio',
  redirectUri: 'http://localhost:4200/index',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  // clientId: 'server.code',
  clientId: 'sipe-web',


  // SPA public client: não enviar client secret em aplicações SPA PKCE
  // (o cliente deve ser registrado como _public_ no provedor de identidade)

  // Endpoints configurados manualmente:
  loginUrl: 'http://localhost:9000/oauth2/authorize',
  tokenEndpoint: 'http://localhost:9000/oauth2/token',
  userinfoEndpoint: 'http://localhost:9000/oauth2/userinfo',
  // Endpoint de logout (end-session) do Identity Provider
  logoutUrl: 'http://localhost:9000/oauth2/logout',

  responseType: 'code',
  // Use PKCE for enhanced security in authorization code flow
  disablePKCE: false,

  // set the scope for the permissions the client should request
  // The first four are defined by OIDC.
  // Important: Request offline_access to get a refresh token
  // The api scope is a usecase specific one
  scope: 'openid',

  showDebugInformation: true,
  // Após logout federado, redirecionar o usuário de volta à aplicação
  // Use a URL registrada no provedor (ex.: http://localhost:4200)
  postLogoutRedirectUri: window.location.origin,
};
