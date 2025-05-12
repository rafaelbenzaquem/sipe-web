import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-oauth-callback',
  template: `<p>Autenticando...</p>`
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];

      if (code) {
        const body = new HttpParams()
          .set('grant_type', 'authorization_code')
          .set('code', code)
          .set('redirect_uri', 'http://localhost:4200/login/oauth2/code/angular-client');

        const headers = new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa('angular-client:secret')
        });

        this.http.post<any>('http://localhost:9000/oauth2/token', body.toString(), { headers })
          .subscribe({
            next: tokenResponse => {
              console.log("OAuthCallbackComponent: "+tokenResponse.access_token);
              sessionStorage.setItem('access_token', tokenResponse.access_token);
              this.router.navigate(['/']); // redireciona para a home ou dashboard
            },
            error: err => {
              console.error('Erro ao obter token', err);
            }
          });
      }
    });
  }
}
