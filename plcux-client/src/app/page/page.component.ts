import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiService } from '../api.service';
import { Market } from '../models/market';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit, OnChanges {
  @Input() marketName: string = '';
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.marketName && this.marketName !== '') {
      this.apiService.getHistory(this.marketName).subscribe((markets: Market[]) => {
        console.log(markets)
      })
    }
  }
}
