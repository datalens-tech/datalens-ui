import {extractEntryId, getAvailablePalettesMap, isEntryId} from '../../../../shared';
import {privateRouteMiddleware} from '../../../components/auth/middlewares/auth/private-route-auth';
import {getSourceAuthorizationHeaders} from '../../../components/charts-engine/components/utils';
import {
    getAuthArgsUSPrivate,
    getAuthHeadersUSPrivate,
} from '../../../components/gateway-auth-helpers/us-auth-helpers';
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
        privateRouteMiddleware,
        getAuthArgsBiPrivate: getAuthArgsUSPrivate,
        getAuthHeadersBiPrivate: getAuthHeadersUSPrivate,
    });
};
