import {generateUniqId} from '@gravity-ui/dashkit/helpers';
import {I18n} from 'i18n';
import type {FakeDashData} from 'shared/types/dash';
import {DashLoadPriority} from 'shared/types/dash';
import {DL, URL_QUERY} from 'ui/constants';
import type {SelectorElementType} from 'ui/store/typings/controlDialog';
import Utils from 'ui/utils';

import {CheckboxControlValue, ELEMENT_TYPE} from '../containers/Dialogs/Control/constants';
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

    const data: FakeDashData = {
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
        settings: {
            hideTabs: false,
            expandTOC: false,
            hideDashTitle: false,
            silentLoading: false,
            autoupdateInterval: null,
            dependentSelectors: true,
            maxConcurrentRequests: null,
            loadOnlyVisibleCharts: true,
            loadPriority: DashLoadPriority.Charts,
            globalParams: {},
        },
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

export const getInitialDefaultValue = (elementType: SelectorElementType) => {
    switch (elementType) {
        case ELEMENT_TYPE.CHECKBOX:
            return CheckboxControlValue.FALSE;
        default:
            return undefined;
    }
};
