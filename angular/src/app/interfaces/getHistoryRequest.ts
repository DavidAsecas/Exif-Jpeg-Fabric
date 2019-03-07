import { User } from "./user";

export interface GetHistoryRequest {
    querier: User;
    channel: string;
    imageId: string;
}