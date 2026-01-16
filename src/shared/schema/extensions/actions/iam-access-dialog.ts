import {createAction} from '../../gateway-utils';
import type {GetDatalensOperationResponse} from '../../us/types/operations';
import type {
    BatchListMembersArgs,
    BatchListMembersResponse,
    GetClaimsArgs,
    GetClaimsResponse,
    ListCollectionAccessBindingsArgs,
    ListCollectionAccessBindingsResponse,
    ListSharedEntryAccessBindingsArgs,
    ListSharedEntryAccessBindingsResponse,
    ListWorkbookAccessBindingsArgs,
    ListWorkbookAccessBindingsResponse,
    UpdateCollectionAccessBindingsArgs,
    UpdateSharedEntryAccessBindingsArgs,
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
    listSharedEntryAccessBindings: createAction<
        ListSharedEntryAccessBindingsResponse,
        ListSharedEntryAccessBindingsArgs
    >(async () => []),
    updateSharedEntryAccessBindings: createAction<
        GetDatalensOperationResponse,
        UpdateSharedEntryAccessBindingsArgs
    >(async () => {
        return {} as GetDatalensOperationResponse;
    }),
    getClaims: createAction<GetClaimsResponse, GetClaimsArgs>(async () => {
        return {subjectDetails: []};
    }),
    batchListMembers: createAction<BatchListMembersResponse, BatchListMembersArgs>(async () => {
        return {members: [], nextPageToken: ''};
    }),
};
