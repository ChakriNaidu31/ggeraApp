export interface Coupon {
    _id: string;
    couponId: string;
    couponCode: string;
    description: string;
    validFrom: string;
    validUntil: string;
    amount: string;
    modifiedDate: string;
    isActive: boolean;
}
