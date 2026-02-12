import {CollectionItemEntities} from 'shared';
import type {SharedEntry, SharedEntryBindingsItem} from 'shared/schema';

import type {AttachmentValue} from './constants';
import {Attachment} from './constants';

export const getIsRelationUnbind = (
    currentDirection: AttachmentValue,
    item: SharedEntryBindingsItem,
): item is SharedEntryBindingsItem & SharedEntry => {
    return currentDirection === Attachment.TARGET && 'scope' in item;
};

export const sortEntities = (entities: SharedEntryBindingsItem[]) =>
    entities.sort(
        (a, b) =>
            (a.entity === CollectionItemEntities.WORKBOOK ? 0 : 1) -
            (b.entity === CollectionItemEntities.WORKBOOK ? 0 : 1),
    );
