import {extractEntryId, getAvailablePalettesMap, isEntryId} from '../../../../shared';
import {getSourceAuthorizationHeaders} from '../../../components/charts-engine/components/utils';
import {handleEntryRedirect} from '../../../controllers/utils/handle-entry-redirect';
import {registry} from '../../index';
import {
    getAuthArgsUSPrivate,
    getAuthHeadersUSPrivate,
    privateRouteMiddleware,
} from '../../utils/us-auth-helpers';

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
