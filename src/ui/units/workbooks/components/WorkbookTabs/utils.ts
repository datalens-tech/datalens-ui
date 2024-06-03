import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';
import {DL} from 'ui/constants/common';
import {isMobileView} from 'ui/utils/mobile';

import {TAB_ALL} from './constants';
import type {Item} from './types';

const i18n = I18n.keyset('new-workbooks.table-filters');

export const getWorkbookTabs = (workbook: WorkbookWithPermissions): Item[] => {
    const iamResources = DL.IAM_RESOURCES;
    const isLimitedViewerMode = Boolean(iamResources?.workbook.roles.limitedViewer);

    const showDataTabs =
        (!isLimitedViewerMode || (isLimitedViewerMode && workbook.permissions.view)) &&
        !isMobileView;

    const result: Item[] = [];

    result.push({
        id: TAB_ALL,
        title: i18n('switch_filter-by-scope-all'),
    });

    result.push(
        {
            id: EntryScope.Dash,
            title: i18n('switch_filter-by-scope-dash'),
        },
        {
            id: EntryScope.Widget,
            title: i18n('switch_filter-by-scope-widget'),
        },
    );

    if (showDataTabs) {
        result.push(
            {
                id: EntryScope.Dataset,
                title: i18n('switch_filter-by-scope-dataset'),
            },
            {
                id: EntryScope.Connection,
                title: i18n('switch_filter-by-scope-connection'),
            },
        );
    }

    return result;
};
