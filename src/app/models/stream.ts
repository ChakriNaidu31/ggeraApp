export class Stream {

    _id: string;
    id: string;
    name: string;
    orderId: string;
    gameId: string;
    streamLink: string;
    description: string;
    amount: string;
    userList: [StreamUser];
    waitlistUsers: [StreamUser];
    createdBy: string;
    createdByUser: StreamUser;
    serverDescription: string;
    platform: string;
    startedTime: Date;
    status: string;
    endedTime: Date;
    slots: StreamUser[];
    clients: StreamUser[];
    /** When >= 3, show "Join waitlist" instead of "Join the stream". API may send this; otherwise use clients?.length */
    currentPlayingUsers?: StreamUser[];
    reportedUsers: StreamUser[];
    availableSlots: number;
    isClientTimerStopped: boolean;
    isAlreadyFinishedPlaying: boolean;
    totalAmount: string;
    taxAmountForAdmin: string;
    gameName: string;
    embedUrl?: any; // display only, set by component
}

interface StreamUser {
    type: string;
    email: string;
    username: string;
    joinedTime: Date;
    timerInMinutes: number;
    formattedTimer: string; // This is used just for display purpose
    stoppedTimeByCreator: Date;
    stoppedTime: string;
    userBalance: string;
    summary: string;
    region: string;
    kd: number;
    wins: number;
    kills: number;
    profileImageUrl: string;
    orderCount: number;
    rating: string;
    userType: string;
}
