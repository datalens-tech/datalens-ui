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

export const registerCommonPlugins = () => {
    registry.common.functions.register({
        getAvailablePalettesMap,
        getSourceAuthorizationHeaders,
        isEntryId,
        extractEntryId,
        handleEntryRedirect,
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
