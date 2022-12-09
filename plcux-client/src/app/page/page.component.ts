import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { Chart, ChartDataset, Color } from 'chart.js';
import { ApiService } from '../api.service';
import { DataPoint } from '../models/dataPoint';
import { Market } from '../models/market';
import 'chartjs-adapter-date-fns';

interface Button {
  text: string;
  class: string;
  interval: number;
}

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
})
export class PageComponent implements OnInit, OnChanges {
  private readonly HOUR = 60 * 60;
  private readonly DAY = this.HOUR * 24;
  private readonly WEEK = this.DAY * 7;
  private readonly MONTH = this.DAY * 30;
  @Input() marketName: string = '';

  history: Array<DataPoint> = [];
  intervalButtons: Button[];
  timeButtons: Button[];
  currentIntervalButtonIndex: number = 2;
  currentTimeRangeButtonIndex: number = 1;
  public chart: Chart;
  datasets: any;
  marketNameView: string;
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.createChart();
    this.intervalButtons = [
      {
        text: '1H',
        class: 'btn-outline-secondary',
        interval: this.HOUR,
      },
      {
        text: '4H',
        class: 'btn-outline-secondary',
        interval: this.HOUR * 4,
      },
      {
        text: '1D',
        class: 'btn-outline-secondary',
        interval: this.DAY,
      },
      {
        text: '1W',
        class: 'btn-outline-secondary',
        interval: this.WEEK,
      }
    ];

    this.timeButtons = [
      {
        text: '7D',
        class: 'btn-outline-secondary',
        interval: this.WEEK,
      },
      {
        text: '30D',
        class: 'btn-outline-secondary',
        interval: this.MONTH,
      },
      {
        text: '90D',
        class: 'btn-outline-secondary',
        interval: this.MONTH * 3,
      },
      {
        text: '180D',
        class: 'btn-outline-secondary',
        interval: this.MONTH * 6,
      }
    ];
    this.intervalButtons[this.currentIntervalButtonIndex].class = 'btn-secondary';
    this.timeButtons[this.currentTimeRangeButtonIndex].class = 'btn-secondary';
    this.updateChartData(
      Date.now() - this.timeButtons[this.currentTimeRangeButtonIndex].interval * 1000,
      Date.now(),
      this.intervalButtons[this.currentIntervalButtonIndex].interval);
    this.changeNameView();
  }

  createChart() {
    this.datasets = [
      {
        label: this.marketName,
        data: [],
      },
    ];

    this.chart = new Chart('MyChart', {
      type: 'line',
      data: {
        datasets: this.datasets,
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                hour: 'MMM-dd hh:mm',
              },
            },
            ticks: {
              maxTicksLimit: 10,
            },
          },
        },
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.marketName && this.marketName !== '') {
      this.changeNameView();
      this.updateChartData(
        Date.now() - this.timeButtons[this.currentTimeRangeButtonIndex].interval * 1000,
        Date.now(),
        this.intervalButtons[this.currentIntervalButtonIndex].interval);
    }
  }

  private changeNameView() {
    this.marketNameView = this.marketName.replace('_', '/');

    this.chart.data.datasets[0].label = this.marketNameView;
    this.chart.update();
  }

  changeInterval(b: number) {
    this.intervalButtons[this.currentIntervalButtonIndex].class = 'btn-outline-secondary'
    this.intervalButtons[b].class = 'btn-secondary'
    this.currentIntervalButtonIndex = b;
    this.updateChartData(
      Date.now() - this.timeButtons[this.currentTimeRangeButtonIndex].interval * 1000,
      Date.now(),
      this.intervalButtons[this.currentIntervalButtonIndex].interval);
  }

  changeTimeRange(b: number) {
    this.timeButtons[this.currentTimeRangeButtonIndex].class = 'btn-outline-secondary'
    this.timeButtons[b].class = 'btn-secondary'
    this.currentTimeRangeButtonIndex = b;
    this.updateChartData(
      Date.now() - this.timeButtons[this.currentTimeRangeButtonIndex].interval * 1000,
      Date.now(),
      this.intervalButtons[this.currentIntervalButtonIndex].interval);
  }

  private updateChartData(from: number, to: number, interval: number) {
    this.apiService
      .getHistory(this.marketName, from, to, interval)
      .subscribe((history: DataPoint[]) => {
        this.history = history;
        this.chart.data.datasets[0].data = this.historyToChartData(history);
        this.chart.update();
      });
  }

  historyToChartData(history: DataPoint[]): any {
    return history.map((point: DataPoint) => {
      return { x: point.time, y: point.price };
    });
  }
}
