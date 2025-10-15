import {createAction} from '../../gateway-utils';
import type {GetDatalensOperationResponse} from '../../us/types/operations';
import type {
    BatchListAccessBindingsArgs,
    BatchListAccessBindingsResponse,
    BatchListMembersArgs,
    BatchListMembersResponse,
    GetClaimsArgs,
    GetClaimsResponse,
    ListCollectionAccessBindingsArgs,
    ListCollectionAccessBindingsResponse,
    ListWorkbookAccessBindingsArgs,
    ListWorkbookAccessBindingsResponse,
    UpdateCollectionAccessBindingsArgs,
    UpdateWorkbookAccessBindingsArgs,
} from '../types';

export const iamAccessDialogActions = {
    listCollectionAccessBindings: createAction<
        ListCollectionAccessBindingsResponse,
        ListCollectionAccessBindingsArgs
    >(async () => []),
    updateCollectionAccessBindings: createAction<
        GetDatalensOperationResponse,
        UpdateCollectionAccessBindingsArgs
    >(async () => {
        return {} as GetDatalensOperationResponse;
    }),
    listWorkbookAccessBindings: createAction<
        ListWorkbookAccessBindingsResponse,
        ListWorkbookAccessBindingsArgs
    >(async () => []),
    updateWorkbookAccessBindings: createAction<
        GetDatalensOperationResponse,
        UpdateWorkbookAccessBindingsArgs
    >(async () => {
        return {} as GetDatalensOperationResponse;
    }),
    getClaims: createAction<GetClaimsResponse, GetClaimsArgs>(async () => {
        return {subjectDetails: []};
    }),
    batchListMembers: createAction<BatchListMembersResponse, BatchListMembersArgs>(async () => {
        return {members: [], nextPageToken: ''};
    }),
    batchListAccessBindings: createAction<
        BatchListAccessBindingsResponse,
        BatchListAccessBindingsArgs
    >(async () => {
        return {
            subjectsWithBindings: [],
            nextPageToken: '',
        };
    }),
};
