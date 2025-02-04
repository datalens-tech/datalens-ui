import type {AxiosRequestConfig} from 'axios';
import {DL} from 'ui';
import {isEmbeddedEntry, isIframe} from 'ui/utils/embedded';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

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
} from '../../../../shared';
import {
    DATALENS_DEBUG_MODE_KEY,
    X_CSRF_TOKEN_HEADER,
} from '../../../components/Widgets/Chart/helpers/helpers';
import Utils from '../../../utils';
import ChartKit from '../DatalensChartKitOld';
import Error from '../Error/Error';
import type {ChartKitDataProvider} from '../components/ChartKitBase/types';
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
        config: isEnabledFeature(Feature.UseConfigurableChartkit),
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
            request.headers[RPC_AUTHORIZATION] = Utils.getRpcAuthorization();

            if (CSRFToken) {
                request.headers[X_CSRF_TOKEN_HEADER] = CSRFToken;
            }

            if (DL.CURRENT_TENANT_ID) {
                request.headers[TENANT_ID_HEADER] = DL.CURRENT_TENANT_ID;
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
};
