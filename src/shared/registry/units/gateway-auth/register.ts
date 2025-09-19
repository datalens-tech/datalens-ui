import {
    getAuthArgsBiPrivate,
    getAuthArgsProxyBiPrivate,
    getAuthArgsUSPrivate,
    getAuthHeadersBiPrivate,
    getAuthHeadersUSPrivate,
    getProxyingAuthArgsUSPrivate,
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
        getProxyingAuthArgsUSPrivate,
        getProxyingAuthArgsBiPrivate: getAuthArgsProxyBiPrivate,
    });
};
