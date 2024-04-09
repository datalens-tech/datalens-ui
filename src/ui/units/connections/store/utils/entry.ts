import {i18n} from 'i18n';

import {getFakeEntry as genericGetFakeEntry} from '../../../../components/ActionPanel';

export const getFakeEntry = (workbookId?: string) => {
    const name = i18n('connections.form', 'section_creation-connection');

    return genericGetFakeEntry({
        workbookId,
        key: name,
        fakeName: name,
    });
};
