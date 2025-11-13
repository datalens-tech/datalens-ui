import {copyWorkbook} from './copy-workbook';
import {createWorkbook} from './create-workbook';
import {deleteWorkbook} from './delete-workbook';
import {deleteWorkbooks} from './delete-workbooks';
import {getWorkbook} from './get-workbook';
import {getWorkbookEntries} from './get-workbook-entries';
import {getWorkbooksList} from './get-workbooks-list';
import {migrateEntriesToWorkbookByCopy} from './migrate-entries-to-workbook-by-copy';
import {migrateEntriesToWorkbookByTransfer} from './migrate-entries-to-workbook-by-transfer';
import {moveWorkbook} from './move-workbook';
import {moveWorkbooks} from './move-workbooks';
import {updateWorkbook} from './update-workbook';

export const workbooksActions = {
    createWorkbook,
    getWorkbook,
    getWorkbooksList,
    updateWorkbook,
    moveWorkbook,
    moveWorkbooks,
    deleteWorkbook,
    copyWorkbook,
    deleteWorkbooks,
    getWorkbookEntries,
    migrateEntriesToWorkbookByTransfer,
    migrateEntriesToWorkbookByCopy,
};
