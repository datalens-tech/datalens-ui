import {extractEntryId, getAvailablePalettesMap, isEntryId} from '../../../../shared';
import {getSourceAuthorizationHeaders} from '../../../components/charts-engine/components/utils';
import {
    getAuthArgsProxyBIPrivate,
    getAuthArgsProxyUSPrivate,
    getAuthArgsUSPrivate,
    getAuthHeadersBIPrivate,
    getAuthHeadersUSPrivate,
    hasValidWorkbookTransferAuthHeaders,
} from '../../../components/gateway-auth-helpers';
import {handleEntryRedirect} from '../../../controllers/utils/handle-entry-redirect';
import {registry} from '../../index';

import {onEmbedsControllerBeforeResponse} from './functions-map/on-embeds-controller-before-response';
import {onEmbedsControllerStart} from './functions-map/on-embeds-controller-start';

export const registerCommonPlugins = () => {
    registry.common.functions.register({
        getAvailablePalettesMap,
        getSourceAuthorizationHeaders,
        isEntryId,
        extractEntryId,
        handleEntryRedirect,
        onEmbedsControllerBeforeResponse,
        onEmbedsControllerStart,
    });

    registry.common.auth.register({
        getAuthArgsUSPrivate,
        getAuthHeadersUSPrivate,
        getAuthArgsProxyUSPrivate,
        getAuthHeadersBIPrivate,
        hasValidWorkbookTransferAuthHeaders,
        getAuthArgsProxyBIPrivate,
    });
};
