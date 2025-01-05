import { EliteOrderProUser } from "./elite-order-pro-user";

export interface EliteOrder {
    id: string;
    orderId: string;
    numberOfUsersInvolved: number;
    loggedTime: string;
    totalAmountTransferred: string;
    startedTime: Date;
    endTime: Date;
    clientName: string;
    clientEmail: string;
    clientImageUrl: string;
    inProgressProUsers: EliteOrderProUser[];
    completedProUsers: EliteOrderProUser[];
    availableSlots: number;

    status: string;
    ongoingTime: number;
    modifiedDate: Date;
    lowNotificationSent: boolean;
    userBalance: string;
}
