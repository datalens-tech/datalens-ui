import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {WorkbookTableRowExtendedContentProps} from './types/components/workbookTableRowExtendedContent';

export const workbooksComponentsMap = {
    CustomActionPanelWorkbookActions: makeDefaultEmpty<{}>(),
    WorkbookTableRowExtendedContent: makeDefaultEmpty<WorkbookTableRowExtendedContentProps>(),
} as const;
