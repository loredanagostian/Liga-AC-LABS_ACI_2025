import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, switchMap} from "rxjs";
import {AccountModel} from "../models/account-model";
import {TransactionAddModel, TransactionModel} from "../models/transaction-model";
import {UserModel} from "../models/user-model";
import {ResponseCode} from "../interfaces/responseCode.enum";

export interface AnomalyModel {
    cardNumber: string;
    amount: number;
    timestamp: string;
    reason: string;
}

@Injectable({
    providedIn: 'root'
})
export class FrontEndService {

    constructor(private readonly _httpClient: HttpClient) {}

    // Get all accounts
    getAccounts(): Observable<any> {
        console.log("getAccounts");
        return this._httpClient.get<any>('accounts/v1/');
    }

    // Get paginated transactions (all accounts)
    getTransactionsPagination(pageSize: number, pageIndex: number): Observable<any> {
        return this._httpClient.get<any>(
            `accounts/v1/transactionsPagination/?page=${pageIndex}&size=${pageSize}`
        );
    }

    // Get paginated transactions of a specific account
    getTransactionsPaginationOfAccount(account: AccountModel, pageSize: number, pageIndex: number): Observable<any> {
        return this._httpClient.get<any>(
            `accounts/v1/transactionsPagination/${account.cardNumber}/?page=${pageIndex}&size=${pageSize}`
        );
    }

    // Get transactions of a specific account (non-paginated or original endpoint)
    getTransactionsOfAccount(account: AccountModel, pageSize: number, pageIndex: number): Observable<any> {
        return this._httpClient.get<any>(
            `accounts/v1/transactions/${account.cardNumber}/?page=${pageIndex}&size=${pageSize}`
        );
    }

    // Get transactions of a specific account filtered by response code
    getTransactionsOfAccountByStatus(account: AccountModel, returnCode: ResponseCode): Observable<any> {
        return this._httpClient.get<any>(
            `accounts/v1/transactions/${account.cardNumber}/status/${returnCode}`
        );
    }

    // Add a new transaction
    addTransaction(transaction: TransactionAddModel): Observable<any> {
        return this._httpClient.post<any>('payments/', transaction);
    }

    updateTransaction(transaction: TransactionModel): Observable<any> {
        console.log('Calling PUT with URL:', `payments/${transaction.id}`);
        console.log('Transaction object:', transaction);
        return this._httpClient.put<any>(`payments/${transaction.id}`, transaction);
    }

    retryTransaction(transaction: TransactionModel): Observable<any> {
        return this.updateTransaction(transaction).pipe(
            switchMap(() => {
                const retryDto = {
                    cardNumber: transaction.cardNumber,
                    amount: transaction.amount,
                    timestamp: new Date().toISOString()
                };
                return this.addTransaction(retryDto);
            })
        );
    }


    // Get anomalies for given transactions
    getAnomalies(transactions: TransactionAddModel[]): Observable<AnomalyModel[]> {
        return this._httpClient.post<AnomalyModel[]>('/anomaly', transactions);
    }

    // Create a new user account
    createUserAccount(userModel: UserModel): Observable<any> {
        console.log("createAccount");
        return this._httpClient.post<any>('register/', userModel);
    }

    // Delete an account by card number
    deleteAccount(account: AccountModel): Observable<any> {
        return this._httpClient.delete<any>(`accounts/v1/delete/${account.cardNumber}`);
    }
}
