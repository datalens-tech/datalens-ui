import type {BaseSchema} from '@gravity-ui/gateway';

import {sharedRegistry} from '../../../shared/registry';
import {getServiceEndpoints} from '../../endpoints/schema';

import {actions} from './actions';

export default {
    actions,
    endpoints: getServiceEndpoints('us'),
    serviceName: 'us-private',
    getAuthArgs: (req, res) => {
        const {getAuthArgsUSPrivate} = sharedRegistry.gatewayAuth.functions.getAll();
        return getAuthArgsUSPrivate(req, res);
    },
    getAuthHeaders: (params) => {
        const {getAuthHeadersUSPrivate} = sharedRegistry.gatewayAuth.functions.getAll();
        return getAuthHeadersUSPrivate(params);
    },
} satisfies BaseSchema[string];
