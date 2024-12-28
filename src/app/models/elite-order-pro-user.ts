export interface EliteOrderProUser {
    status: string;
    email: string;
    name: string;
    type: string;
    profileImageUrl: string;
    requestedTime: Date;
    acceptedTime: Date;
    rejectedTime: Date;
    completedTime: Date;
    timerInMinutes: number; // This is used for display and time entered
    formattedTime: string; // This is used just for display purpose
}
