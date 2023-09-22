import type {ItemsStateAndParams} from '@gravity-ui/dashkit/build/esm/shared';

export type GetDashStateResponse = {
    createdAt: string;
    entryId: string;
    hash: string;
    data: ItemsStateAndParams;
};

export interface GetDashStateArgs {
    entryId: string;
    hash: string;
}

export interface CreateDashStateResponse {
    hash: string;
}

export interface CreateDashStateArgs {
    entryId: string;
    data: ItemsStateAndParams;
}
