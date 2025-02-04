import {isEmbeddedEntry, isIframe} from 'ui/utils/embedded';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import Utils from 'ui/utils/utils';

import {
    ACCEPT_LANGUAGE_HEADER,
    DISABLE,
    DISABLE_JSONFN_SWITCH_MODE_COOKIE_NAME,
    DISPLAY_MODE_HEADER,
    ENABLE,
    Feature,
    SUPERUSER_SWITCH_MODE_COOKIE_NAME,
    SuperuserHeader,
    RPC_AUTHORIZATION,
    TENANT_ID_HEADER,
} from '../../../shared';
import {DL} from '../../constants';

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
    config: isEnabledFeature(Feature.UseConfigurableChartkit),
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

        if (Utils.getRpcAuthorization()) {
            request.headers[RPC_AUTHORIZATION] = Utils.getRpcAuthorization();
        }
        let dispayMode = 'basic';

        if (isEmbeddedEntry()) {
            dispayMode = 'secure-embedded';
        } else if (isIframe()) {
            dispayMode = 'embedded';
        }
        request.headers[DISPLAY_MODE_HEADER] = dispayMode;

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

        return request;
    },
    noJsonFn:
        isEnabledFeature(Feature.NoJsonFn) ||
        Utils.getCookie(DISABLE_JSONFN_SWITCH_MODE_COOKIE_NAME) === DISABLE,
});

export default ChartKit;
