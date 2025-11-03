import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface VersionInfo {
  version: string;
}

@Injectable({ providedIn: 'root' })
export class VersionService {
  private readonly versionUrl = 'version.json';
  private readonly version$: Observable<VersionInfo>;

  constructor(private http: HttpClient) {
    // Cache the result so we only fetch once per app load
    this.version$ = this.http.get<VersionInfo>(this.versionUrl).pipe(shareReplay(1));
  }

  getVersion(): Observable<VersionInfo> {
    return this.version$;
  }
}
