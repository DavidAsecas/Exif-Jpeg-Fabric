import { User } from "./user";

export interface SellLicenseRequest {
    seller: User;
    buyer: User;
    channel: string;
    transaction: string;
}