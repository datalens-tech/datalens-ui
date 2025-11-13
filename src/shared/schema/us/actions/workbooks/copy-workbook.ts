import {TIMEOUT_60_SEC} from '../../../../constants';
import {createAction} from '../../../gateway-utils';
import type {CopyWorkbookArgs, CopyWorkbookResponse} from '../../types';

export const copyWorkbook = createAction<CopyWorkbookResponse, CopyWorkbookArgs>({
    method: 'POST',
    path: ({workbookId}) => `/v2/workbooks/${workbookId}/copy`,
    params: ({collectionId, title}, headers) => ({body: {collectionId, title}, headers}),
    timeout: TIMEOUT_60_SEC,
});
