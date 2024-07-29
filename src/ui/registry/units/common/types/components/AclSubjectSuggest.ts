import type {ListItemData} from '@gravity-ui/uikit';

import type {
    ClaimsSubjectType,
    SubjectClaims,
} from '../../../../../../shared/schema/extensions/types';

type AclSubject = ListItemData<SubjectClaims>;

export type AclSubjectSuggestProps = {
    availableGroups: {
        id: ClaimsSubjectType;
        name: string;
    }[];
    fetchSubjects: (
        search: string,
        type?: ClaimsSubjectType,
        pageToken?: string,
    ) => Promise<
        | {
              subjects: AclSubject[];
              nextPageToken?: string;
          }
        | AclSubject[]
    >;
    onSubjectChange: (subject: AclSubject) => void;
};
