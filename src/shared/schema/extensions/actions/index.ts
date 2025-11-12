import {iamAccessDialogActions} from './iam-access-dialog';
import {organizationManager} from './organization-manager';

export const actions = {
    ...iamAccessDialogActions,
    ...organizationManager,
};
