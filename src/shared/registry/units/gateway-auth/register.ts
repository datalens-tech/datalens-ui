import {
    getAuthArgsBiPrivate,
    getAuthArgsProxyBiPrivate,
    getAuthArgsProxyUSPrivate,
    getAuthArgsUSPrivate,
    getAuthHeadersBiPrivate,
    getAuthHeadersUSPrivate,
    hasValidWorkbookTransferAuthHeaders,
} from '../../../components/auth/gateway-auth-helpers';
import {sharedRegistry} from '../../index';

export const registerGatewayAuthPlugins = () => {
    sharedRegistry.gatewayAuth.functions.register({
        getAuthArgsUSPrivate,
        getAuthHeadersUSPrivate,
        getAuthArgsBiPrivate,
        getAuthHeadersBiPrivate,
        hasValidWorkbookTransferAuthHeaders,
        getAuthArgsProxyBiPrivate,
        getAuthArgsProxyUSPrivate,
    });
};
