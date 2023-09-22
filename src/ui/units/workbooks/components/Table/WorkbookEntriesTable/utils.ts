import {EntryScope} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';

import navigateHelper from '../../../../../libs/navigateHelper';
import type {WorkbookEntry} from '../../../types';

export const getWorkbookEntryUrl = (
    workbookEntry: WorkbookEntry,
    workbook: WorkbookWithPermissions,
): string => {
    if (
        workbookEntry.scope === EntryScope.Widget &&
        !workbook.permissions.view &&
        workbook.permissions.limitedView
    ) {
        return `/preview/${workbookEntry.entryId}`;
    }

    return new URL(navigateHelper.redirectUrlSwitcher(workbookEntry), window.location.origin)
        .pathname;
};
