import { User } from "./user";

export class InheritHistoryRequest {
    parent: string;
    child: string;
    seller: User;
    buyer: User;
    image: string;
}