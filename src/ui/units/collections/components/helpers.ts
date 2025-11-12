import type {AppInstallation} from 'shared';
import {CollectionItemEntities} from 'shared';
import type {ExtendedWorkbook, StructureItem} from 'shared/schema/types';
import {DL} from 'ui';
import {registry} from 'ui/registry';
import {COLLECTIONS_PATH, WORKBOOKS_PATH} from 'ui/units/collections-navigation/constants';

import {mockSharedEntriesTexts} from './constants';

export const getIsWorkbookItem = (item: StructureItem): item is ExtendedWorkbook => {
    if (item.entity) {
        return item.entity === CollectionItemEntities.WORKBOOK;
    } else {
        return 'workbookId' in item;
    }
};

export const getItemKey = (item: StructureItem) => {
    switch (item.entity) {
        case CollectionItemEntities.COLLECTION:
            return item.collectionId;
        case CollectionItemEntities.WORKBOOK:
            return item.workbookId;
        case CollectionItemEntities.ENTRY:
            return item.key;
        default:
            return getIsWorkbookItem(item) ? item.workbookId : item.collectionId;
    }
};

export const getItemLink = (item: StructureItem) => {
    const {getUIEntryRoute} = registry.common.functions.getAll();

    switch (item.entity) {
        case CollectionItemEntities.COLLECTION:
            return `${COLLECTIONS_PATH}/${item.collectionId}`;
        case CollectionItemEntities.WORKBOOK:
            return `${WORKBOOKS_PATH}/${item.workbookId}`;
        case CollectionItemEntities.ENTRY:
            return new URL(
                getUIEntryRoute({
                    origin: window.location.origin,
                    installationType: window.DL.installationType as AppInstallation,
                    endpoints: DL.ENDPOINTS,
                    entry: item,
                }),
            ).pathname;
        default:
            return getIsWorkbookItem(item)
                ? `${WORKBOOKS_PATH}/${item.workbookId}`
                : `${COLLECTIONS_PATH}/${item.collectionId}`;
    }
};

export const getSharedEntryMockText = (key: keyof typeof mockSharedEntriesTexts) => {
    return mockSharedEntriesTexts[key];
};
