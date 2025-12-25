import {i18n} from 'i18n';
import {getFakeEntry as genericGetFakeEntry} from 'ui/components/ActionPanel';
import type {GetFakeEntry} from 'ui/registry/units/connections/types/getFakeEntry';

export const getFakeEntry: GetFakeEntry = (workbookId, collectionId) => {
    const name = i18n('connections.form', 'section_creation-connection');

    return genericGetFakeEntry({
        workbookId,
        collectionId,
        key: name,
        fakeName: name,
    });
};
