import {
    ACCEPT_LANGUAGE_HEADER,
    DASH_INFO_HEADER,
    DISABLE,
    DISABLE_JSONFN_SWITCH_MODE_COOKIE_NAME,
    ENABLE,
    Feature,
    SUPERUSER_SWITCH_MODE_COOKIE_NAME,
    SuperuserHeader,
    TENANT_ID_HEADER,
} from '../../../shared';
import {DL, Scope} from '../../constants';
import {getStore} from '../../store';
import Utils from '../../utils';

import Error from './Error/Error';
import renderControl from './extensions/control';
import renderMarkdown from './extensions/markdown';
import renderTable from './extensions/table';

import ChartKit from '.';

export const X_CSRF_TOKEN_HEADER = 'X-CSRF-Token';
export const DATALENS_DEBUG_MODE_KEY = 'datalens-debug-mode';

ChartKit.registerPlugins(renderTable, renderControl, renderMarkdown);

ChartKit.setGeneralSettings({
    lang: DL.USER_LANG,
    isMobile: DL.IS_MOBILE,
    theme: 'common',
    config: Utils.isEnabledFeature(Feature.UseConfigurableChartkit),
    requestIdPrefix: DL.REQUEST_ID_PREFIX,
    ErrorComponent: Error,
});

ChartKit.setDataProviderSettings({
    endpoint: DL.ENDPOINTS.charts,
    lang: DL.USER_LANG,
    includeUnresolvedParams: true,
    requestDecorator: (request) => {
        const CSRFToken = Utils.getCSRFToken();

        request.headers[ACCEPT_LANGUAGE_HEADER] = DL.USER_LANG;

        if (CSRFToken) {
            request.headers[X_CSRF_TOKEN_HEADER] = CSRFToken;
        }

        if (DL.CURRENT_TENANT_ID) {
            request.headers[TENANT_ID_HEADER] = DL.CURRENT_TENANT_ID;
        }

        if (DL.DISPLAY_SUPERUSER_SWITCH) {
            const cookieValue = Utils.getCookie(SUPERUSER_SWITCH_MODE_COOKIE_NAME);
            const headerValue = cookieValue === ENABLE;
            if (cookieValue) {
                request.headers[SuperuserHeader.XDlAllowSuperuser] = headerValue;
                request.headers[SuperuserHeader.XDlSudo] = headerValue;
            }
        }

        const datalensDebugMode = Utils.restore(DATALENS_DEBUG_MODE_KEY);

        if (datalensDebugMode === 1) {
            request.data.datalensDebugMode = 1;
        }

        const {entryContent, dash} = getStore().getState();
        if (entryContent.scope === Scope.Dash && dash) {
            const dashInfo = {
                ...(dash.entry?.entryId ? {dashId: dash?.entry?.entryId} : {}),
                ...(dash.tabId ? {dashTabId: dash.tabId} : {}),
            };

            request.headers[DASH_INFO_HEADER] = new URLSearchParams(dashInfo).toString();
        }

        return request;
    },
    noJsonFn:
        Utils.isEnabledFeature(Feature.NoJsonFn) ||
        (Utils.getCookie(SUPERUSER_SWITCH_MODE_COOKIE_NAME) === ENABLE &&
            Utils.getCookie(DISABLE_JSONFN_SWITCH_MODE_COOKIE_NAME) === DISABLE),
});

export default ChartKit;
