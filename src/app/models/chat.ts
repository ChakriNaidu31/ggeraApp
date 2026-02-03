export interface Chat {
    id: string;
    orderId: string;
    email: string;
    imageUrl: string;
    name: string;
    lastMessage: string;
    lastMessageTime: Date;
    isLastMessageRead: boolean;
    unreadCount: number;
    isActiveChat: boolean;
    conversationType: string;
}
