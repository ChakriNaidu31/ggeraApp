import { Coupon } from "./coupon";
import { ProUser } from "./pro-user";

export interface CouponUser {
    coupon: Coupon;
    user: ProUser;
    dateUsed: Date;
    amountCredited: string;
}
