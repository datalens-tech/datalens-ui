import type {ListItemData} from '@gravity-ui/uikit';

import type {
    ClaimsSubjectType,
    SubjectClaims,
} from '../../../../../../shared/schema/extensions/types';

export type AclSubject = ListItemData<SubjectClaims>;

export type AclSubjectSuggestProps = {
    fetchSubjects?: (
        search: string,
        tabId: ClaimsSubjectType,
        pageToken?: string,
    ) => Promise<
        | {
              subjects: AclSubject[];
              nextPageToken?: string;
          }
        | AclSubject[]
    >;
    onSubjectChange: (subject: AclSubject) => void;
    selectedTab?: ClaimsSubjectType;
};
