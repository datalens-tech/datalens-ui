export enum DashUpdateStatus {
    Loading = 'loading',
    Successed = 'successed',
    Failed = 'failed',
}

export type GlobalItem =
    | Pick<DashTabItemControl, 'type' | 'data' | 'id'>
    | Pick<DashTabItemGroupControl, 'type' | 'data' | 'id'>;

export type GlobalItemWihoutId =
    | Pick<DashTabItemControl, 'type' | 'data'>
    | Pick<DashTabItemGroupControl, 'type' | 'data'>;
