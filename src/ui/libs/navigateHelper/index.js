import {EntryScope, NAVIGATION_ROUTE, getEntryNameByKey, makeSlugName} from 'shared';
import {DL} from 'ui/constants';
import {getRouter} from 'ui/navigation';
import {registry} from 'ui/registry';

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
        getRouter().open(this.redirectUrlSwitcher(entry));
    },
    openNavigation() {
        getRouter().open(formUrl(DL.NAVIGATION_ENDPOINT));
    },
    openPlace(entry) {
        getRouter().open(this.redirectToPlace(entry));
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
