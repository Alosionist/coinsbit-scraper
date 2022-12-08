import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { Market } from '../models/market';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.css']
})
export class PricesComponent {
  @Input() markets: Array<Market> = [];

  @Output() chosenMarket: EventEmitter<string> = new EventEmitter();

  onClick(marketName: string) {
    this.chosenMarket.emit(marketName)
  }
}
