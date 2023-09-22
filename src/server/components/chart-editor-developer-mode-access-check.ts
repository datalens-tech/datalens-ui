import {DeveloperModeCheckStatus} from '../../shared/types';
export const checkRequestForDeveloperModeAccess = async () => {
    return DeveloperModeCheckStatus.Allowed;
};
