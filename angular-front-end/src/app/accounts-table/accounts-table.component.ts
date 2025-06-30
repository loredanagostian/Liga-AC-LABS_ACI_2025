import { Component } from '@angular/core';
import { AccountModel } from "../models/account-model";
import { FrontEndService } from "../utils/front-end.service";
import { Router } from "@angular/router";
import { TransactionModel } from "../models/transaction-model";
import { SelectionModel } from "@angular/cdk/collections";
import { forkJoin } from "rxjs";
import { UserService } from "../utils/user.service";
import { PageEvent } from "@angular/material/paginator";
import { MAT_SELECT_CONFIG, MatSelectConfig } from '@angular/material/select';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { DialogComponent } from "../dialog/dialog.component";

@Component({
    selector: 'app-accounts-table',
    templateUrl: './accounts-table.component.html',
    styleUrls: ['./accounts-table.component.scss'],
    providers: [
        {
            provide: MAT_SELECT_CONFIG,
            useValue: { disableOptionCentering: true } as MatSelectConfig
        }
    ]
})
export class AccountsTableComponent {
    constructor(
        private frontEndService: FrontEndService,
        private router: Router,
        private userService: UserService,
        private dialog: MatDialog
    ) {}

    userRole: string = localStorage.getItem('userRole') || 'UNDEFINED';

    displayedColumnsAccounts: string[] =
        ['id', 'cardNumber', 'cardHolderName', 'amount', 'dailyTxLimit', 'dailyTxSumLimit', 'dailyTx', 'dailyTxSum'];


    displayedColumnsTransactions: string [] = ['id', 'amount', 'cardNumber', 'returnCode', 'timestamp', 'retry'];

    isAccountsSelected = false;
    isTransactionsSelected = false;
    isTransactionsShowSelected = false;
    isCreateNewUserAccountSelected = false;

    accountsData: AccountModel[] = [];
    transactionsData: TransactionModel[] = [];
    totalTransactionsCount = 0;
    pageSize = 10;
    pageIndex = 0;
    lastSelectedAccounts: AccountModel[] = [];

    showTransactionData() {
        this.lastSelectedAccounts = [];
        this.frontEndService.getTransactionsPagination(this.pageSize, this.pageIndex).subscribe((res: any) => {
            this.transactionsData = res.content || [];
            this.totalTransactionsCount = res.totalElements || 0;
        });

        this.isTransactionsSelected = true;
        this.isAccountsSelected = false;
    }

    get displayedTransactionColumnsWithoutRetry() {
        return this.displayedColumnsTransactions.filter(c => c !== 'retry');
    }

    showAccountsData() {
        this.frontEndService.getAccounts().subscribe(data => {
            this.accountsData = data;
        });

        this.pageIndex = 0;
        this.pageSize = 10;
        this.isTransactionsShowSelected = false;
        this.isTransactionsSelected = false;
        this.isAccountsSelected = true;
    }

    getStatistics() {
        this.router.navigate(['/statistics']);
    }

    logOut() {
        this.userService.logoutUser();
    }

    selection = new SelectionModel<any>(true, []);

    masterToggle() {
        this.isAllSelected() ? this.selection.clear() : this.accountsData.forEach(row => this.selection.select(row));
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.accountsData.length;
        return numSelected === numRows;
    }

    showTransactionDataByAccount(selectedAccounts) {
        this.lastSelectedAccounts = selectedAccounts;

        const fetchTransactionsObservables = selectedAccounts.map(account =>
            this.frontEndService.getTransactionsPaginationOfAccount(account, this.pageSize, this.pageIndex)
        );

        forkJoin(fetchTransactionsObservables).subscribe((allTransactions: any[]) => {
            let totalTransactions = 0;
            this.transactionsData = [];

            for (const res of allTransactions) {
                this.transactionsData = this.transactionsData.concat(res.content || []);
                totalTransactions += res.totalElements || 0;
            }

            this.totalTransactionsCount = totalTransactions;
        });

        this.selection = new SelectionModel<any>(true, []);
        this.isTransactionsShowSelected = true;
        this.isTransactionsSelected = true;
        this.isAccountsSelected = false;
    }

    showAnalytics(selectedAccounts: any) {
        this.router.navigate(['/analytics'],{
            state:{selectedAccounts: selectedAccounts}
        });

    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;

        if (this.isTransactionsShowSelected) {
            this.showTransactionDataByAccount(this.lastSelectedAccounts);
        } else if (this.isTransactionsSelected) {
            this.showTransactionData();
        }
    }

    openDialog(selection: SelectionModel<any>): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.width = '60%';
        dialogConfig.data = { selectedAccount: selection[0] };
        dialogConfig.closeOnNavigation = true;

        const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
        dialogRef.componentInstance.transactionMade.subscribe(() => {
            this.selection.clear();
        });
    }

    createTransaction(selectedAccounts) {
        if (selectedAccounts.length === 0) {
            alert("Please select at least one account");
            return;
        }
        if (selectedAccounts.length > 1) {
            alert("Please select only one account");
            return;
        }
        this.openDialog(selectedAccounts);
    }

    goToAnomalies() {
        this.router.navigate(['/anomalies']);
    }

    deleteSelectedAccount(selectedAccounts) {
        if (selectedAccounts.length === 0) {
            alert("Please select at least one account");
            return;
        }
        if (selectedAccounts.length > 1) {
            alert("Please select only one account");
            return;
        }

       for (const account of selectedAccounts) {
           this.frontEndService.deleteAccount(account).subscribe({
                next: () => {
                     this.accountsData = this.accountsData.filter(a => a.cardNumber !== account.cardNumber);
                     this.selection.clear();
                     alert("Account deleted successfully");
                },
                error: (err) => {
                     console.error("Error deleting account:", err);
                     alert("Failed to delete account. Please try again.");
                }

           });

       }

    }

    createNewUserAccount() {
        this.isAccountsSelected = false;
        this.isTransactionsSelected = false;
        this.isTransactionsShowSelected = false;
        this.isCreateNewUserAccountSelected = true;
    }

    retryTransaction(transaction: TransactionModel) {
        this.frontEndService.retryTransaction(transaction).subscribe({
            next: (res) => {
                console.log('Retry success:', res);
                transaction.retried = true;

            },
            error: (err) => {
                console.error('Retry failed:', err);
                alert("Failed to retry transaction: " + err.error);
            }
        });
    }
}
