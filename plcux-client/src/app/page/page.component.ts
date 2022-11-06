import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ChartDataset } from 'chart.js';
import { ApiService } from '../api.service';
import { DataPoint } from '../models/dataPoint';
import { Market } from '../models/market';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
})
export class PageComponent implements OnInit, OnChanges {
  @Input() marketName: string = '';
  history: Array<DataPoint> = [];
  chartData = [
    {
      data: [
        {
          x: '2021-11-06 23:39:30',
          y: 50,
        },
        {
          x: '2021-11-07 01:00:28',
          y: 60,
        },
        {
          x: '2021-11-07 09:00:28',
          y: 20,
        },
      ],
      label: 'market name',
    },
  ];

  chartOptions = {
    scales: {
      x: {
        type: 'time',
      },
    },
  };
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.marketName && this.marketName !== '') {
      this.apiService
        .getHistory(this.marketName)
        .subscribe((history: DataPoint[]) => {
          this.history = history;
        });
    }
  }
}
