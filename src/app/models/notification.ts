import { ProUser } from "./pro-user";

export interface Notification {
    id: string;
    title: string;
    message: string;
    link: string;
    isRead: boolean;
    user: ProUser;
    avatar: string;
    relativeDays: string;
}
