import { Component, OnInit } from '@angular/core';
import { FrontEndService } from '../utils/front-end.service';
import { Router } from '@angular/router';

interface AnomalyModel {
    cardNumber: string;
    amount: number;
    timestamp: string;
    reason: string;
}

@Component({
    selector: 'app-anomalies',
    templateUrl: './anomalies.component.html',
    styleUrls: ['./anomalies.component.scss']
})
export class AnomaliesComponent implements OnInit {

    anomalies: AnomalyModel[] = [];
    filterReason: string = '';
    displayLimit: number = 10;
    availableLimits: number[] = [10, 25, 50];
    loading = false;
    error = false;
    displayedColumns: string[] = ['cardNumber', 'amount', 'timestamp', 'reason'];

    constructor(private frontEndService: FrontEndService, private router: Router) {}

    ngOnInit(): void {
        this.loadAnomalies();
    }

    loadAnomalies(): void {
        this.loading = true;
        this.error = false;
        this.anomalies = [];

        this.frontEndService.getTransactionsPagination(1000, 0).subscribe({
            next: (transactionResponse) => {
                const transactions = transactionResponse.content;
                this.frontEndService.getAnomalies(transactions).subscribe({
                    next: (anomalies) => {
                        this.anomalies = anomalies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Anomaly detection failed:', err);
                        this.error = true;
                        this.loading = false;
                    }
                });
            },
            error: (err) => {
                console.error('Failed to load transactions:', err);
                this.error = true;
                this.loading = false;
            }
        });
    }

    get filteredAnomalies(): AnomalyModel[] {
        const filtered = this.anomalies.filter(a =>
            a.reason.toLowerCase().includes(this.filterReason.toLowerCase())
        );
        return filtered.slice(0, this.displayLimit);
    }

    onFilterChange(value: string): void {
        this.filterReason = value;
    }

    goBack(): void {
        this.router.navigate(['/accounts']);
    }

    trackByFn(index: number, item: AnomalyModel): number {
        return index;
    }
}
