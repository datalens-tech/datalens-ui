import {embedUsageActions} from './embed-usage';
import {entriesActions} from './entries';
import {tenantActions} from './tenant';

export const actions = {
    ...entriesActions,
    ...tenantActions,
    ...embedUsageActions,
};
