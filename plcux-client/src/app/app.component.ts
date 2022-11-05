import { Component } from '@angular/core';
import { Market } from './models/market';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  marketName: string;

  onMarketChoosen(marketName: string): void {
    this.marketName = marketName;
  }
}
