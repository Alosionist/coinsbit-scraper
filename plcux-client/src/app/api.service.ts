import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Market } from './models/market';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly MARKETS = '/api/markets';

  constructor(private http: HttpClient) { }

  get markets$(): Observable<string[]> {
    return this.http.get<string[]>(this.MARKETS);
  }

  getMerket(market: string): Observable<Market> {
    return this.http.get<Market>(`${this.MARKETS}/${market}`);
  }

  getHistory(market: string, from?: Date, to?: Date): Observable<Market[]> {
    return this.http.get<Market[]>(`${this.MARKETS}/${market}/history`);
  }
}
