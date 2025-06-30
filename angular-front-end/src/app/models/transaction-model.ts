export interface TransactionModel {
    id: number,
    amount: number,
    cardNumber: string,
    returnCode: number,
    timestamp: string,
    retried: boolean
}
export interface TransactionAddModel {
    cardNumber: string,
    amount: number,
    timestamp: string
}
