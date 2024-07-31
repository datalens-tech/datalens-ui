import type {SubjectClaims} from '../../../../../shared/schema/extensions/types';
import {ClaimsSubjectType} from '../../../../../shared/schema/extensions/types';

export const getSubjectName = (subject: SubjectClaims): string | null => {
    switch (subject.subType) {
        case ClaimsSubjectType.Group:
        case ClaimsSubjectType.ServiceAccount:
            return subject.name || subject.sub;
        case ClaimsSubjectType.UserAccount:
        case ClaimsSubjectType.Invitee:
            return (
                `${subject.givenName} ${subject.familyName}`.trim() ||
                subject.name ||
                subject.preferredUsername
            );
        default:
            return null;
    }
};
