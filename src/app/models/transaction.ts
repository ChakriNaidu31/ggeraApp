export interface Transaction {
    amount: string;
    orderId: string;
    currentBalance: string;
    description: string;
    modifiedDate: Date;
    previousBalance: string;
    type: string;
    _id: string;
}
