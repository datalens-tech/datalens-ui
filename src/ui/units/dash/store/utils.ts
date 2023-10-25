import {generateUniqId} from '@gravity-ui/dashkit';
import {I18n} from 'i18n';
import {DL, URL_QUERY} from 'ui/constants';
import Utils from 'ui/utils';

import {Mode} from '../modules/constants';

const storeI18n = I18n.keyset('dash.store.view');
const dashCreateI18n = I18n.keyset('component.dialog-create-dashboard.view');

export const getFakeDashEntry = (workbookId?: string) => {
    const salt = Math.random().toString();
    const {counter, id: newTabId} = generateUniqId({salt, counter: 0, ids: []});

    // For saving the full path when creating from a folder in navigation
    const searchParams = new URLSearchParams(location.search);
    const searchCurrentPath = searchParams.get(URL_QUERY.CURRENT_PATH);

    const path = searchCurrentPath || DL.USER_FOLDER;

    const initialKey = `${path}${dashCreateI18n('label_default-name')}`;

    const data = {
        tabs: [
            {
                id: newTabId,
                items: [],
                title: storeI18n('label_tab-default-name'),
                layout: [],
                aliases: {},
                connections: [],
            },
        ],
        counter,
        salt,
    };

    return {
        mode: Mode.Edit,
        entry: {
            data,
            fake: true,
            key: initialKey,
            fakeName: dashCreateI18n('label_default-name'),
            workbookId,
        },
        data,
        tabId: newTabId,
        hashStates: {},
        permissions: {
            execute: true,
            read: true,
            edit: true,
            admin: true,
        },
        navigationPath: Utils.getNavigationPathFromKey(initialKey),
    };
};
