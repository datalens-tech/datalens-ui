import type {DashTabItemControl, DashTabItemGroupControl} from 'shared/types';

export enum DashUpdateStatus {
    Loading = 'loading',
    Successed = 'successed',
    Failed = 'failed',
}

export type GlobalItem =
    | Pick<DashTabItemControl, 'type' | 'data' | 'id'>
    | Pick<DashTabItemGroupControl, 'type' | 'data' | 'id'>;
