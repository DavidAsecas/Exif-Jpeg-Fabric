import { User } from "./user";

export class GetHistoryRequest {
    querier: User;
    channel: string;
    imageId: string;
}