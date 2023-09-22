import {DL} from 'ui';
import {isCurrentTenantWithOrg} from 'utils/tenant';

import {FieldKey} from '../constants';
import {FormDict} from '../typings';

export const getMdbFolderId = (form: FormDict) => {
    return isCurrentTenantWithOrg()
        ? ((form[FieldKey.MdbFolderId] || '') as string)
        : DL.CURRENT_TENANT_ID;
};
