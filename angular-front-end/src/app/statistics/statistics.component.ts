import { Component, OnInit } from '@angular/core';
import { FrontEndService } from "../utils/front-end.service";
import { Router } from "@angular/router";
import { ChartOptions, ChartConfiguration, Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import {TransactionModel as Transaction} from "../models/transaction-model";
import {AccountModel as Account} from "../models/account-model";

Chart.register(zoomPlugin);


@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
    timeUnit: 'day' | 'week' | 'month' | 'year' | 'all' = 'day';
    currentDate = new Date();
    allStartYear = 2020;

    transactions: Transaction[] = [];
    accounts: Account[]  =[];
    selectedAccount: string | null = null;

    chartLabels: string[] = [];
    // Two separate chart datasets:
    chartDataGeneral: ChartConfiguration<'line'>['data']['datasets'] = [];
    chartDataErrors: ChartConfiguration<'line'>['data']['datasets'] = [];

    chartOptions: ChartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        return Number.isInteger(value) ? value : null;
                    }
                }
            }
        },
        plugins: {
            zoom: {
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'x',
                },
                pan: {
                    enabled: true,
                    mode: 'x',
                },
            },
        },
    };

    readonly errorCodes: { [code: string]: string } = {
        "31": "Insufficient funds",
        "32": "Card holder not found",
        "33": "Tx limit exceeded",
        "34": "Tx sum exceeded",
        "35": "Tx sum will be exceeded",
        "36": "Inactive account"
    };

    readonly errorColors: string[] = [
        '#ffe119', '#911eb4', '#46f0f0',
        '#008080', '#9a6324',  '#800000'
    ];

    constructor(private frontEndService: FrontEndService, private router: Router) { }

    ngOnInit() {
        this.loadData();
        this.loadAccounts();
    }

    loadData() {
        this.transactions = [];
        const pageSize = 20;
        let pageIndex = 0;

        const loadPage = () => {
            const request = this.selectedAccount == null
                ? this.frontEndService.getTransactionsPagination(pageSize, pageIndex)
                : this.frontEndService.getTransactionsOfAccount(
                    this.accounts.find(acc => acc.cardNumber === this.selectedAccount)!,
                    pageSize,
                    pageIndex
                );

            request.subscribe(response => {
                const data = response.content || response;
                this.transactions.push(...data);

                if (data.length === pageSize) {
                    pageIndex++;
                    loadPage();
                } else {
                    this.updateChart();
                }
            });
        };

        loadPage();
    }

    onAccountChange() {
        if (this.selectedAccount === 'null') {
            this.selectedAccount = null;
        }
        this.loadData();
    }

    loadAccounts() {
        this.frontEndService.getAccounts().subscribe((data) => {
            this.accounts = data;
        })
    }

    updateChart() {
        const start = this.getStartOfPeriod(this.currentDate, this.timeUnit);
        const end = this.getEndOfPeriod(this.currentDate, this.timeUnit);
        const labels: string[] = [];
        const allData: number[] = [];
        const successData: number[] = [];
        const failedData: number[] = [];

        const errorSeries: { [code: string]: number[] } = {};
        Object.keys(this.errorCodes).forEach(code => {
            errorSeries[code] = [];
        });

        // Fill labels based on timeUnit
        if (this.timeUnit === 'day') {
            for (let hour = 0; hour < 24; hour++) {
                labels.push(`${hour}:00`);
            }
        } else if (this.timeUnit === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 0; i < 7; i++) {
                const labelDate = new Date(start);
                labelDate.setDate(start.getDate() + i);
                labels.push(days[labelDate.getDay()]);
            }
        } else if (this.timeUnit === 'month') {
            const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                labels.push(i.toString());
            }
        } else if (this.timeUnit === 'year') {
            const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];
            labels.push(...months);
        } else if (this.timeUnit === 'all') {
            const currentYear = new Date().getFullYear();
            for (let year = this.allStartYear; year <= currentYear; year++) {
                labels.push(year.toString());
            }
        }

        // Initialize counters
        for (let i = 0; i < labels.length; i++) {
            allData.push(0);
            successData.push(0);
            failedData.push(0);
            Object.keys(errorSeries).forEach(code => errorSeries[code].push(0));
        }

        // Count transactions per label
        this.transactions.forEach(t => {
            const ts = new Date(t.timestamp);
            if (this.timeUnit === 'all' || (ts >= start && ts <= end)) {
                let index = 0;
                if (this.timeUnit === 'day') {
                    index = ts.getHours();
                } else if (this.timeUnit === 'week') {
                    const dayDiff = Math.floor((ts.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    index = dayDiff;
                } else if (this.timeUnit === 'month') {
                    index = ts.getDate() - 1;
                } else if (this.timeUnit === 'year') {
                    index = ts.getMonth();
                } else if (this.timeUnit === 'all') {
                    const year = ts.getFullYear();
                    index = year - this.allStartYear;
                    if (index < 0 || index >= labels.length) return;
                }

                allData[index]++;
                if (t.returnCode.toString() === '00') {
                    successData[index]++;
                } else {
                    failedData[index]++;
                    if (errorSeries[t.returnCode]) {
                        errorSeries[t.returnCode][index]++;
                    }
                }
            }
        });

        // General chart datasets
        const generalData = [
            {
                label: 'All Transactions',
                data: allData,
                borderColor: 'blue',
                backgroundColor: 'transparent',
                tension: 0.1,
                fill: false,
                pointRadius: 2
            },
            {
                label: 'Succeeded',
                data: successData,
                borderColor: 'green',
                backgroundColor: 'transparent',
                tension: 0.1,
                fill: false,
                pointRadius: 2
            },
            {
                label: 'Failed',
                data: failedData,
                borderColor: 'red',
                backgroundColor: 'transparent',
                tension: 0.1,
                fill: false,
                pointRadius: 2
            }
        ];

        // Error breakdown chart datasets
        const errorData: ChartConfiguration<'line'>['data']['datasets'] = [];
        let colorIndex = 0;
        Object.entries(errorSeries).forEach(([code, data]) => {
            const name = this.errorCodes[code];
            errorData.push({
                label: name,
                data: data,
                borderColor: this.errorColors[colorIndex % this.errorColors.length],
                backgroundColor: 'transparent',
                tension: 0.1,
                fill: false,
                pointRadius: 2
            });
            colorIndex++;
        });

        this.chartLabels = labels;
        this.chartDataGeneral = generalData;
        this.chartDataErrors = errorData;
    }

    get currentPeriodLabel(): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        if (this.timeUnit === 'day') {
            return this.currentDate.toLocaleDateString(undefined, options);
        } else if (this.timeUnit === 'week') {
            const start = this.getStartOfPeriod(this.currentDate, 'week');
            const end = this.getEndOfPeriod(this.currentDate, 'week');
            return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        } else if (this.timeUnit === 'month') {
            return this.currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        } else if (this.timeUnit === 'year') {
            return this.currentDate.toLocaleDateString(undefined, { year: 'numeric' });
        } else if (this.timeUnit === 'all') {
            return `${this.allStartYear} - ${new Date().getFullYear()}`;
        }
        return '';
    }

    getStartOfPeriod(date: Date, unit: string): Date {
        const d = new Date(date);
        if (unit === 'day') {
            d.setHours(0, 0, 0, 0);
        } else if (unit === 'week') {
            const day = d.getDay();
            d.setDate(d.getDate() - day);
            d.setHours(0, 0, 0, 0);
        } else if (unit === 'month') {
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
        } else if (unit === 'year') {
            d.setMonth(0, 1);
            d.setHours(0, 0, 0, 0);
        }
        return d;
    }

    getEndOfPeriod(date: Date, unit: string): Date {
        const d = new Date(date);
        if (unit === 'day') {
            d.setHours(23, 59, 59, 999);
        } else if (unit === 'week') {
            const day = d.getDay();
            d.setDate(d.getDate() + (6 - day));
            d.setHours(23, 59, 59, 999);
        } else if (unit === 'month') {
            d.setMonth(d.getMonth() + 1, 0);
            d.setHours(23, 59, 59, 999);
        } else if (unit === 'year') {
            d.setMonth(11, 31);
            d.setHours(23, 59, 59, 999);
        }
        return d;
    }

    goBack() {
        if (this.timeUnit === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() - 1);
        } else if (this.timeUnit === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else if (this.timeUnit === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else if (this.timeUnit === 'year') {
            this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
        }
        this.updateChart();
    }

    goForward() {
        if (this.timeUnit === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() + 1);
        } else if (this.timeUnit === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else if (this.timeUnit === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else if (this.timeUnit === 'year') {
            this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
        }
        this.updateChart();
    }

    goToDashboard() {
        this.router.navigate(['/accounts']);
    }
}
