import { PremadePartyUser } from "./premade-party-user";

export interface PremadeParty {
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
    clientUser: PremadePartyUser;
    userList: [PartyUser];
    createdBy: string;
    createdByUser: string;
    serverDescription: string;
    platform: string;
    startedTime: Date;
    status: string;
    endedTime: Date;
    slots: PartyUser[];
    clients: PartyUser[];
    reportedUsers: PartyUser[];
    availableSlots: number;
    isClientTimerStopped: boolean;
    isAlreadyFinishedPlaying: boolean;
    totalAmount: string;
    taxAmountForAdmin: string;
    gameName: string;
}

interface PartyUser {
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
