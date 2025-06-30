import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FrontEndService} from "../utils/front-end.service";
import {Router} from "@angular/router";
import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);
import {forkJoin} from 'rxjs';
import {ResponseCode} from "../interfaces/responseCode.enum";

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit,OnDestroy {
  @ViewChild('transactionChart') transactionChart: ElementRef;



  userRole: string = localStorage.getItem('userRole') || 'UNDEFINED';
  analyticsData: any[] = [];
  transactionsData: any[] = [];
  charts : any[] = [];

  private colorPalette = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)'
  ];

  constructor(
      private frontEndService: FrontEndService,
      private router: Router
  ) {

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.analyticsData = navigation.extras.state['selectedAccounts'];
      this.loadTransactionData();
    }
  }

  ngOnInit(): void {

  }
    ngOnDestroy(): void {

        this.charts.forEach(chart => {
        if (chart) {
            chart.destroy();
        }
        });
    }


  loadTransactionData() {
    if (!this.analyticsData.length) return;

    const fetchRequests = this.analyticsData.map(account =>

        this.frontEndService.getTransactionsOfAccountByStatus(account, ResponseCode.APPROVED)
    );


    forkJoin(fetchRequests).subscribe((results: any[]) => {
      this.transactionsData = [];
      console.log('Transactions Data:', results);

      results.forEach(res => {
        this.transactionsData = this.transactionsData.concat(res || []);
      });
      if (!this.transactionsData.length) {
        this.transactionsData = [];

      }

      this.renderCharts();
    });
  }
  navigateToAccounts() {
    this.router.navigate(['/accounts'], );
  }
  renderCharts() {
    setTimeout(() => {
        this.createTransactionAmountChart();
        this.createTransactionTimelineChartByMonth();
        this.createAmountTimelineChart();

    }, 100);
  }

  createTransactionAmountChart() {
    const ctx = document.getElementById('amountChart') as HTMLCanvasElement;


    const accountLabels = this.analyticsData.map(acc => acc.cardHolderName);
    const accountData = this.analyticsData.map(acc => {
      const accountTransactions = this.transactionsData.filter(tx =>
          tx.cardNumber === acc.cardNumber
      );
      return accountTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    });

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: accountLabels,
        datasets: [{
          label: 'Total Transaction Amount',
          data: accountData,
          backgroundColor: this.colorPalette.slice(0, accountLabels.length),
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 1
        }]
      },

      options: {
        responsive: true
      }
    });
  }


  createTransactionTimelineChartByMonth() {
    const ctx = document.getElementById('timelineChartByMonth') as HTMLCanvasElement;

    const userMonthMap: { [user: string]: { [month: string]: number } } = {};
    const allMonthsSet = new Set<string>();

    this.analyticsData.forEach(account => {
      const userName = account.cardHolderName;
      const userCardNumber = account.cardNumber;
      const userTransactions = this.transactionsData.filter(tx => tx.cardNumber === userCardNumber);

      userMonthMap[userName] = {};

      userTransactions.forEach(tx => {
        if (!tx.timestamp) return;

        const date = new Date(tx.timestamp);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        allMonthsSet.add(month);
        if (!userMonthMap[userName][month]) {
          userMonthMap[userName][month] = 0;
        }
        userMonthMap[userName][month] += 1;
      });
    });


    const sortedMonths = Array.from(allMonthsSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());


    const userData = Object.keys(userMonthMap).map((user, index) => {
      const monthCounts = userMonthMap[user];
      const data = sortedMonths.map(month => monthCounts[month] || 0);
      return {
        label: user,
        data: data,
        fill: true,
        borderColor: this.colorPalette[index % this.colorPalette.length],
        backgroundColor: this.colorPalette[index % this.colorPalette.length],
        pointHoverBackgroundColor: this.colorPalette[index % this.colorPalette.length]
      };
    });

    let chart =
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedMonths,
        datasets: userData
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy'
            },
            limits: {
              y: {min: 0},
            },
          },
          title: {
            display: true,
            text: 'Monthly Transaction Timeline by User'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Transaction Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  createAmountTimelineChart() {
    const ctx = document.getElementById('amountTimelineChartByMonth') as HTMLCanvasElement;

    const userMonthAmountMap: { [user: string]: { [month: string]: number } } = {};
    const allMonthsSet = new Set<string>();

    this.analyticsData.forEach(account => {
      const userName = account.cardHolderName;
      const userCardNumber = account.cardNumber;
      const userTransactions = this.transactionsData.filter(tx => tx.cardNumber === userCardNumber);

      userMonthAmountMap[userName] = {};

      userTransactions.forEach(tx => {
        if (!tx.timestamp) return;

        const date = new Date(tx.timestamp);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        allMonthsSet.add(month);

        if (!userMonthAmountMap[userName][month]) {
          userMonthAmountMap[userName][month] = 0;
        }

        userMonthAmountMap[userName][month] += tx.amount || 0;
      });
    });

    const sortedMonths = Array.from(allMonthsSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const userData = Object.keys(userMonthAmountMap).map((user, index) => {
      const monthAmounts = userMonthAmountMap[user];
      const data = sortedMonths.map(month => monthAmounts[month] || 0);
      return {
        label: user,
        data: data,
        fill: true,
        borderColor: this.colorPalette[index % this.colorPalette.length],
        backgroundColor: this.colorPalette[index % this.colorPalette.length].replace('0.8', '0.3'),
        tension: 0.1,
        pointHoverBackgroundColor: this.colorPalette[index % this.colorPalette.length]
      };
    });

    let chart =
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedMonths,
        datasets: userData
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy'
            },
            limits: {
              y: {min: 0},
            },
          },
          title: {
            display: true,
            text: 'Monthly Transaction Amount by User'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Transaction Amount'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }







}

