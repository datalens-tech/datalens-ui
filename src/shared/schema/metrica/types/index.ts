export interface Counter {
    id: string;
    create_date: string;
    create_time?: string;
    name?: string;
}

export interface GetCountersResponse {
    counters: Counter[];
    rows: number;
}

export interface GetCountersArgs {
    token: string;
}
