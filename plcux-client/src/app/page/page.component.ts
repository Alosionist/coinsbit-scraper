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
  time: number;
}

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
})
export class PageComponent implements OnInit, OnChanges {
  private readonly HOUR = 60 * 60 * 1000;
  private readonly DAY = this.HOUR * 24;
  private readonly WEEK = this.DAY * 7;
  @Input() marketName: string = '';
  @Output() update: EventEmitter<string> = new EventEmitter();

  history: Array<DataPoint> = [];
  buttons: Button[];
  currentButtonIndex: number = 2;
  refreshBtnText = 'Refresh'
  public chart: Chart;
  datasets: any;
  marketNameView: string;
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.createChart();
    this.buttons = [
      {
        text: '1H',
        class: 'btn-outline-secondary',
        time: this.HOUR,
      },
      {
        text: '4H',
        class: 'btn-outline-secondary',
        time: this.HOUR * 4,
      },
      {
        text: '1D',
        class: 'btn-secondary',
        time: this.DAY,
      },
      {
        text: '1W',
        class: 'btn-outline-secondary',
        time: this.WEEK,
      },
      {
        text: 'All',
        class: 'btn-outline-secondary',
        time: Date.now(),
      }
    ];
    this.updateChartData(Date.now() - this.buttons[this.currentButtonIndex].time);
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
      this.updateChartData(Date.now() - this.buttons[this.currentButtonIndex].time);
    }
  }

  private changeNameView() {
    this.marketNameView = this.marketName.replace('_', '/');

    this.chart.data.datasets[0].label = this.marketNameView;
    this.chart.update();
  }

  changeTimeRange(b: number) {
    this.buttons[this.currentButtonIndex].class = 'btn-outline-secondary'
    this.buttons[b].class = 'btn-secondary'
    this.currentButtonIndex = b;
    this.updateChartData(Date.now() - this.buttons[this.currentButtonIndex].time);
  }

  refresh() {
    this.updateChartData(Date.now() - this.buttons[this.currentButtonIndex].time);
    this.update.emit("magic!");
  }

  private updateChartData(from: number) {

    this.apiService
      .getHistory(this.marketName, from)
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
