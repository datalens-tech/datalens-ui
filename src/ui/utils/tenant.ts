import {DL} from 'constants/common';

import {isTenantIdWithOrgId} from 'shared';

export const isCurrentTenantWithOrg = () => isTenantIdWithOrgId(DL.CURRENT_TENANT_ID);
