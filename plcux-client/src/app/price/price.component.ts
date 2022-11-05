import { Component, Input, OnInit } from '@angular/core';
import { Market } from '../models/market';
import { ReplacePipe } from '../replace.pipe';


@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.css']
})
export class PriceComponent implements OnInit {
  @Input() market: Market = {};
  constructor() { }
  
  ngOnInit(): void {
  }

}
