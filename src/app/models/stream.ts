export class Stream {

    _id: string;
    id: string;
    name: string;
    orderId: string;
    gameId: string;
    streamLink: string;
    description: string;
    currentPlayingUsers: number;
    proName: string; // display only
    videoUrl: string;
    embedUrl: string; // display only
    clientUser: StreamUser;
    userList: [StreamUser];
    waitlistUsers: [StreamUser];
    createdBy: string;
    createdByUser: string;
    serverDescription: string;
    platform: string;
    startedTime: Date;
    status: string;
    endedTime: Date;
    slots: StreamUser[];
    clients: StreamUser[];
    reportedUsers: StreamUser[];
    availableSlots: number;
    isClientTimerStopped: boolean;
    isAlreadyFinishedPlaying: boolean;
    totalAmount: string;
    taxAmountForAdmin: string;
    gameName: string;
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
}
