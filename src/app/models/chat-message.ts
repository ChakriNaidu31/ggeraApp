export interface ChatMessage {
    id: string;
    from: 'me' | 'partner';
    message: string;
    sentTime: Date;
    imageUrl: string;
    username: string;
    isLine: Boolean;
}
