import {BreadcrumbsItem} from '@gravity-ui/uikit';
import {History, Location} from 'history';
import {EntryBreadcrumbsProps} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';
import Utils from 'ui/utils';

export const getWorkbookBreadcrumbsItems = ({
    entry,
    workbookName,
    history,
    location,
}: {
    entry: EntryBreadcrumbsProps['entry'];
    workbookName: EntryBreadcrumbsProps['workbookName'];
    history: History;
    location: Location;
}): BreadcrumbsItem[] => {
    if (!entry) {
        return [];
    }

    const rootName = workbookName || 'Workbook';
    let entryName = Utils.getEntryNameFromKey(entry.key || '');
    entryName = (entry as {fake?: boolean}).fake ? '' : entryName;
    const fakeName = (entry as {fakeName?: string}).fakeName;

    const items: BreadcrumbsItem[] = [];

    const workbookId = entry.workbookId;

    if (workbookId) {
        items.push({
            text: rootName,
            action: () => {
                history.push({
                    ...location,
                    pathname: `/workbooks/${workbookId}`,
                });
            },
        });
    }

    if (entryName) {
        items.push({
            text: entryName,
            action: () => {},
        });
    } else if (fakeName) {
        items.push({
            text: fakeName,
            action: () => {},
        });
    }

    return items;
};
