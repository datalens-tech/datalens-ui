import {CollectionItemEntities} from 'shared';
import type {SharedEntry, SharedEntryBindingsItem} from 'shared/schema';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import type {AttachmentValue} from './constants';
import {Attachment} from './constants';

export const getIsRelationUnbind = (
    currentDirection: AttachmentValue,
    item: SharedEntryBindingsItem,
): item is SharedEntryBindingsItem & SharedEntry => {
    return currentDirection === Attachment.TARGET && 'scope' in item;
};

export const getRelationText = (entities: SharedEntryBindingsItem[]) => {
    const hasEntry = entities.some((e) => e.entity === CollectionItemEntities.ENTRY);
    const hasWorkbook = entities.some((e) => e.entity === CollectionItemEntities.WORKBOOK);

    if (hasEntry && hasWorkbook) {
        return getSharedEntryMockText('relations-bindings-dialog-delete');
    } else if (hasEntry) {
        return getSharedEntryMockText('relation-dataset-bindings-dialog-delete');
    } else if (hasWorkbook) {
        return getSharedEntryMockText('relation-workbook-bindings-dialog-delete');
    } else {
        return '';
    }
};

export const sortEntities = (entities: SharedEntryBindingsItem[]) =>
    entities.sort(
        (a, b) =>
            (a.entity === CollectionItemEntities.WORKBOOK ? 0 : 1) -
            (b.entity === CollectionItemEntities.WORKBOOK ? 0 : 1),
    );
