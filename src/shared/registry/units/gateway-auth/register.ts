import {
    getAuthArgsProxyBIPrivate,
    getAuthArgsProxyUSPrivate,
    getAuthArgsUSPrivate,
    getAuthHeadersBIPrivate,
    getAuthHeadersUSPrivate,
    hasValidWorkbookTransferAuthHeaders,
} from '../../../components/auth/gateway-auth-helpers';
import {sharedRegistry} from '../../index';

export const registerGatewayAuthPlugins = () => {
    sharedRegistry.gatewayAuth.functions.register({
        getAuthArgsUSPrivate,
        getAuthHeadersUSPrivate,
        getAuthHeadersBIPrivate,
        hasValidWorkbookTransferAuthHeaders,
        getAuthArgsProxyBIPrivate,
        getAuthArgsProxyUSPrivate,
    });
};
