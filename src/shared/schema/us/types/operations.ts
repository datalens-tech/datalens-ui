import type z from 'zod';

import type {DATALENS_OPERATION} from '../../../constants/operations';
import type {AccessBindingDelta} from '../../extensions/types';
import type {datalensOperationSchema} from '../schemas/operation';

export type GetDatalensOperationArgs = {
    operationId: string;
};

export type GetDatalensOperationResponse = z.infer<typeof datalensOperationSchema>;

type CreateCollectionOperationMeta = {
    type: typeof DATALENS_OPERATION.CREATE_COLLECTION;
};

type CreateWorkbookOperationMeta = {
    type: typeof DATALENS_OPERATION.CREATE_WORKBOOK;
};

type CreateSharedEntryOperationMeta = {
    type: typeof DATALENS_OPERATION.CREATE_SHARED_ENTRY;
};

type CopyWorkbookOperationMeta = {
    type: typeof DATALENS_OPERATION.COPY_WORKBOOK;
};

type UpdateCollectionAccessBindingsOperationMeta = {
    type: typeof DATALENS_OPERATION.UPDATE_COLLECTION_ACCESS_BINDINGS;
    deltas: AccessBindingDelta[];
};

type UpdateWorkbookAccessBindingsOperationMeta = {
    type: typeof DATALENS_OPERATION.UPDATE_WORKBOOK_ACCESS_BINDINGS;
    deltas: AccessBindingDelta[];
};

type UpdateSharedEntryAccessBindingsOperationMeta = {
    type: typeof DATALENS_OPERATION.UPDATE_SHARED_ENTRY_ACCESS_BINDINGS;
    deltas: AccessBindingDelta[];
};

type DatalensOperationMeta =
    | CreateCollectionOperationMeta
    | CreateWorkbookOperationMeta
    | CreateSharedEntryOperationMeta
    | CopyWorkbookOperationMeta
    | UpdateCollectionAccessBindingsOperationMeta
    | UpdateWorkbookAccessBindingsOperationMeta
    | UpdateSharedEntryAccessBindingsOperationMeta;

export type FetchDatalensOperationArgs = {
    operationId: string;
    meta: DatalensOperationMeta;
};
