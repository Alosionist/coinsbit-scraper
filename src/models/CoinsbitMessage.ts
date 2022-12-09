export interface CoinsbitMessage {
    id?: number;
    method: string;
    params: Array<any>;
    result?: Array<any[]>;
}