import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import type {EntryScope} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';
import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';
import type {CreateEntryActionType} from 'ui/units/workbooks/constants';
import type {Item} from 'units/workbooks/components/WorkbookTabs/types';
import type {WorkbookEntry} from 'units/workbooks/types';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import type {CheckWbCreateEntryButtonVisibility} from './types/functions/checkWbCreateEntryButtonVisibility';

export const workbooksFunctionsMap = {
    getWorkbookTabs: makeFunctionTemplate<(workbook: WorkbookWithPermissions) => Item[]>(),
    getWorkbookEntryUrl:
        makeFunctionTemplate<
            (workbookEntry: WorkbookEntry, workbook: WorkbookWithPermissions) => string
        >(),
    getWorkbookDashboardEntryUrl:
        makeFunctionTemplate<(response: EntryDialogOnCloseArg) => string>(),
    getNewDashUrl: makeFunctionTemplate<(workbookId?: string) => string>(),
    useAdditionalWorkbookEntryActions:
        makeFunctionTemplate<
            (
                workbookEntry: WorkbookEntry,
                workbook: WorkbookWithPermissions,
            ) => DropdownMenuItemMixed<unknown>[]
        >(),
    useAdditionalWorkbookActions:
        makeFunctionTemplate<
            (workbook: WorkbookWithPermissions) => DropdownMenuItemMixed<unknown>[]
        >(),
    useCreateEntryOptions: makeFunctionTemplate<
        ({
            scope,
            handleAction,
        }: {
            scope?: EntryScope;
            handleAction: (action: CreateEntryActionType) => void;
        }) => {
            buttonText: string;
            handleClick?: () => void;
            items: DropdownMenuItemMixed<unknown>[];
            hasMenu: boolean;
        }
    >(),
    checkWbCreateEntryButtonVisibility: makeFunctionTemplate<CheckWbCreateEntryButtonVisibility>(),
    getWorkbookEmptyStateTexts:
        makeFunctionTemplate<
            (scope: EntryScope | undefined) => {title: string; description: string}
        >(),
} as const;
