import { User } from "./user";

export class SellLicenseRequest {
    seller: User;
    buyer: User;
    channel: string;
    transaction: string;
}