export interface SingleOrder {
    id: string;
    orderId: string;
    proName: string;
    clientName: string;
    loggedTime: string;
    amount: string;
    startedDate: Date;
    completedDate: Date;
    status: string;
    reviewBtnDisplay: boolean;
    scheduledStartTime: Date;
    requestedDate: Date;
    requestedBy: string;
    requestedByUser: string;
    requestedTo: string;
    requestedToUser: string;
    userBalance: string;
    requestedByImage: string;
}
