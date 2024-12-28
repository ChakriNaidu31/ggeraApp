export interface Withdrawal {
    id: string;
    username: string,
    email: string,
    requestId: string,
    amount: string,
    mode: string,
    status: string,
    requestedDate: Date,
    approvedDate: Date,
    completedDate: Date
}
