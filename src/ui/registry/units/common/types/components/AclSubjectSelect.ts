import type {RefObject} from 'react';
import type React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';

import type {
    ClaimsSubjectType,
    SubjectClaims,
} from '../../../../../../shared/schema/extensions/types';

import type {AclSubjectSuggestProps} from './AclSubjectSuggest';

export type AclSubject = ListItemData<SubjectClaims>;

export type AclSelectedUser = {
    id: string;
    type: `${ClaimsSubjectType}`;
    roles: string[];
    login: string;
    avatarData?: string;
} & Omit<SubjectClaims, 'sub' | 'subType'>;

export interface AclSubjectSelectProps extends Omit<AclSubjectSuggestProps, 'onSubjectChange'> {
    inputRef?: RefObject<HTMLInputElement>;
    renderSubject?: (subject: SubjectClaims) => React.ReactNode;
    value: AclSelectedUser[];
    onChange: (users: AclSelectedUser[]) => void;
    size?: 'm' | 'l';
    endContent?: React.ReactNode;
}
