import {AxiosRequestConfig} from 'axios';
import {DL, Scope} from 'ui';

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
} from '../../../../shared';
import {
    DATALENS_DEBUG_MODE_KEY,
    X_CSRF_TOKEN_HEADER,
} from '../../../components/Widgets/Chart/helpers/helpers';
import {getStore} from '../../../store';
import Utils from '../../../utils';
import ChartKit from '../DatalensChartKitOld';
import Error from '../Error/Error';
import {ChartKitDataProvider} from '../components/ChartKitBase/types';
import renderControl from '../extensions/control';
import renderMarkdown from '../extensions/markdown';
import renderTable from '../extensions/table';
import {chartsDataProvider} from '../index';
import {getChartkitMenu} from '../modules/menu/menu';

export const initChartKitSettings = () => {
    ChartKit.registerPlugins(renderTable, renderControl, renderMarkdown);

    ChartKit.setGeneralSettings({
        lang: DL.USER_LANG,
        isMobile: DL.IS_MOBILE,
        theme: 'common',
        config: Utils.isEnabledFeature(Feature.UseConfigurableChartkit),
        requestIdPrefix: DL.REQUEST_ID_PREFIX,
        ErrorComponent: Error,
        menu: getChartkitMenu({chartsDataProvider: chartsDataProvider as ChartKitDataProvider}),
    });

    ChartKit.setDataProviderSettings?.({
        endpoint: DL.ENDPOINTS.charts,
        lang: DL.USER_LANG,
        includeUnresolvedParams: true,
        requestDecorator: (request: AxiosRequestConfig) => {
            if (!request.headers) {
                request.headers = {};
            }
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
};
