import { Component, OnInit } from '@angular/core';
import { Market } from './models/market';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly FAV_MARKET = "PLCUX_USDT";
  marketName: string = this.FAV_MARKET;
  markets: Array<Market> = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getMarkets();
  }

  private getMarkets() {
    this.markets = [];
    this.apiService.markets$.subscribe((markets: string[]) => {
      markets.forEach((marketName: string) => {
        this.apiService.getMerket(marketName).subscribe((market: Market) => {
          this.markets.push(market);
        });
      });
    });
  }

  onMarketChoosen(marketName: string): void {
    this.marketName = marketName;
  }

  update() {
    this.getMarkets();
  }
}
