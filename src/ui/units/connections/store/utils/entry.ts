import {i18n} from 'i18n';
import {DL} from 'ui';

import {getFakeEntry as genericGetFakeEntry} from '../../../../components/ActionPanel';

export const getFakeEntry = (workbookId?: string) => {
    const name = i18n('connections.form', 'section_creation-connection');

    return genericGetFakeEntry({
        workbookId,
        key: `${DL.USER_FOLDER}${name}`,
        fakeName: name,
    });
};
