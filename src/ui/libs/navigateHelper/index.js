import {NAVIGATION_ROUTE} from 'shared';

import {EntryScope, getEntryNameByKey, makeSlugName} from '../../../shared';
import {DL} from '../../constants/common';
import {registry} from '../../registry';

const formUrl = (url) => {
    return new URL(url, window.location.origin).toString();
};

const navigateHelper = {
    redirectUrlSwitcher({entryId, scope, type, key}) {
        const {getUIEntryRoute} = registry.common.functions.getAll();

        if (DL.IS_MOBILE && scope === EntryScope.Widget) {
            const name = getEntryNameByKey({key});
            const slugName = makeSlugName(entryId, name);

            return `/preview/${slugName}`;
        }

        return getUIEntryRoute({
            origin: window.location.origin,
            installationType: window.DL.installationType,
            endpoints: DL.ENDPOINTS,
            entry: {entryId, scope, type, key},
        });
    },
    open(entry) {
        const url = this.redirectUrlSwitcher(entry);
        window.location.assign(url);
    },
    openNavigation() {
        window.location.assign(formUrl(DL.NAVIGATION_ENDPOINT));
    },
    openPlace(entry) {
        const url = this.redirectToPlace(entry);
        window.location.assign(url);
    },
    redirectToPlace({scope}) {
        const endpoints = DL.ENDPOINTS;
        const defaultUrl = DL.NAVIGATION_ENDPOINT;
        const url = (() => {
            switch (scope) {
                case 'connection':
                    return endpoints.connections;
                case 'dataset':
                    return endpoints.dataset;
                case 'dash':
                    return endpoints.dash;
                case 'widget':
                    return endpoints.widgets;
                default:
                    return defaultUrl;
            }
        })();

        return formUrl(url);
    },
    getRedirectLocation(entry) {
        const hasWorkbook = entry.workbookId;
        if (hasWorkbook) {
            return `/workbooks/${entry.workbookId}`;
        }

        const urlStr = this.redirectToPlace(entry);
        try {
            const url = new URL(urlStr);
            return url.pathname;
        } catch (e) {
            return `/${NAVIGATION_ROUTE}`;
        }
    },
};

export default navigateHelper;
