import {extractEntryId, getAvailablePalettesMap, isEntryId} from '../../../../shared';
import {getSourceAuthorizationHeaders} from '../../../components/charts-engine/components/utils';
import {
    getAuthArgsUSPrivate,
    getAuthHeadersUSPrivate,
} from '../../../components/gateway-auth-helpers/us-auth-helpers';
import {resolvePrivateRoute} from '../../../components/middleware/resolve-private-route';
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
        resolvePrivateRoute,
        getAuthArgsBiPrivate: getAuthArgsUSPrivate,
        getAuthHeadersBiPrivate: getAuthHeadersUSPrivate,
    });
};
