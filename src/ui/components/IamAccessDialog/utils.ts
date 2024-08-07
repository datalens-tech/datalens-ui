import {I18n} from 'i18n';

import type {SubjectClaims, SubjectDetails} from '../../../shared/schema/extensions/types';
import {ClaimsSubjectType, SubjectType} from '../../../shared/schema/extensions/types';
import {DL, SYSTEM_GROUP_IDS} from '../../constants/common';
import type {ResourceType} from '../../store/actions/iamAccessDialog';

export const getResourceRoles = (type: ResourceType) => {
    const i18n = I18n.keyset('component.iam-access-dialog');

    const iamResources = DL.IAM_RESOURCES;

    const result: {
        title: string;
        value: string;
    }[] = [];

    if (iamResources) {
        const resource = iamResources[type];
        const roles = resource?.roles ?? {};

        if (roles.limitedViewer) {
            result.push({
                title: i18n('role_limited-viewer'),
                value: roles.limitedViewer,
            });
        }

        if (roles.viewer) {
            result.push({
                title: i18n('role_viewer'),
                value: roles.viewer,
            });
        }

        if (roles.editor) {
            result.push({
                title: i18n('role_editor'),
                value: roles.editor,
            });
        }

        if (roles.admin) {
            result.push({
                title: i18n('role_admin'),
                value: roles.admin,
            });
        }
    }

    return result;
};

export const filterByUser = (searchString: string) => {
    if (!searchString) {
        return () => true;
    }

    const lowerSearchString = searchString.toLowerCase();

    return ({user}: {user?: SubjectDetails}) => {
        return Boolean(
            user?.subjectClaims.name.toLowerCase().includes(lowerSearchString) ||
                user?.subjectClaims.familyName.toLowerCase().includes(lowerSearchString) ||
                user?.subjectClaims.givenName.toLowerCase().includes(lowerSearchString) ||
                user?.subjectClaims.email.toLowerCase().includes(lowerSearchString) ||
                user?.subjectClaims.preferredUsername.toLowerCase().includes(lowerSearchString),
        );
    };
};

export const getAccessSubjectType = (subject: SubjectClaims): SubjectType => {
    if (subject.subType === ClaimsSubjectType.ServiceAccount) {
        return SubjectType.ServiceAccount;
    }

    if (subject.subType === ClaimsSubjectType.UserAccount) {
        if (subject.federation) {
            return SubjectType.FederatedUser;
        }

        return SubjectType.UserAccount;
    }

    if (subject.subType === ClaimsSubjectType.Group) {
        if (SYSTEM_GROUP_IDS.includes(subject.sub)) {
            return SubjectType.System;
        }

        return SubjectType.Group;
    }

    if (subject.subType === ClaimsSubjectType.Invitee) {
        return SubjectType.Invitee;
    }

    throw new Error(`Subject type ${subject.subType} is not supported`);
};
