import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from '../api.service';
import { Market } from '../models/market';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.css']
})
export class PricesComponent implements OnInit {
  markets: Array<Market> = [];
  @Output() chosenMarket: EventEmitter<string> = new EventEmitter();
  
  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.apiService.markets$.subscribe((markets: string[]) => {
      markets.forEach((marketName: string) => {
        this.apiService.getMerket(marketName).subscribe((market: Market) => {
          console.log(market);
          
          this.markets.push(market);
        })
      })
      this.chosenMarket.emit(markets[0])
    })
  }

  onClick(marketName: string) {
    this.chosenMarket.emit(marketName)
  }
}
