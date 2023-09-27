import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import type {WorkbookWithPermissions} from 'shared/schema';
import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';
import type {Item} from 'units/workbooks/components/WorkbookTabs/types';
import type {WorkbookEntry} from 'units/workbooks/types';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

export const workbooksFunctionsMap = {
    getWorkbookTabs: makeFunctionTemplate<(workbook: WorkbookWithPermissions) => Item[]>(),
    getWorkbookEntryUrl:
        makeFunctionTemplate<
            (workbookEntry: WorkbookEntry, workbook: WorkbookWithPermissions) => string
        >(),
    getWorkbookDashboardEntryUrl:
        makeFunctionTemplate<(response: EntryDialogOnCloseArg) => string>(),
    useAdditionalWorkbookEntryActions:
        makeFunctionTemplate<
            (
                workbookEntry: WorkbookEntry,
                workbook: WorkbookWithPermissions,
            ) => DropdownMenuItemMixed<unknown>[]
        >(),
    useAdditionalWorkbookActions:
        makeFunctionTemplate<
            (
                workbook: WorkbookWithPermissions,
                onApplyMove: () => void,
                onApplyCopy: (workbookId: string | undefined) => void,
            ) => DropdownMenuItemMixed<unknown>[]
        >(),
} as const;
