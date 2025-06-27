import type {History, Location} from 'history';
import {I18n} from 'i18n';
import type {
    BreadcrumbsItem,
    EntryBreadcrumbsProps,
} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';
import Utils from 'ui/utils';

const i18n = I18n.keyset('component.collection-breadcrumbs');

export const getWorkbookBreadcrumbsItems = ({
    entry,
    workbookBreadcrumbs,
    workbookName,
    history,
    location,
}: {
    entry: EntryBreadcrumbsProps['entry'];
    workbookBreadcrumbs: EntryBreadcrumbsProps['workbookBreadcrumbs'];
    workbookName: EntryBreadcrumbsProps['workbookName'];
    history: History;
    location: Location;
}): BreadcrumbsItem[] => {
    if (!entry) return [];

    const breadcrumbsItems: BreadcrumbsItem[] = [
        {
            text: i18n('label_root-title'),
            action: () => {
                history.push('/collections');
            },
            path: '/collections',
        },
    ];

    if (workbookBreadcrumbs && workbookBreadcrumbs.length > 0) {
        workbookBreadcrumbs.forEach((item: {title: string; collectionId: string}) => {
            breadcrumbsItems.push({
                text: item.title,
                action: () => {
                    history.push({
                        ...location,
                        pathname: `/collections/${item.collectionId}`,
                    });
                },
                path: `/collections/${item.collectionId}`,
            });
        });
    }

    if (workbookName) {
        breadcrumbsItems.push({
            text: workbookName,
            action: () => {
                history.push({
                    ...location,
                    pathname: `/workbooks/${entry.workbookId}`,
                });
            },
            path: `/workbooks/${entry.workbookId}`,
        });
    }

    let entryName = Utils.getEntryNameFromKey(entry?.key || '');
    entryName = (entry as {fake?: boolean}).fake ? '' : entryName;
    const fakeName = (entry as {fakeName?: string}).fakeName;

    if (entryName) {
        breadcrumbsItems.push({
            text: entryName,
            action: () => {},
        });
    } else if (fakeName) {
        breadcrumbsItems.push({
            text: fakeName,
            action: () => {},
        });
    }

    return breadcrumbsItems;
};
