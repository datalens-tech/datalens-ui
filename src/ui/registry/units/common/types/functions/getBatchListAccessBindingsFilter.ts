import type {ClaimsSubjectType} from '../../../../../../shared/schema/extensions/types';

export type GetBatchListAccessBindingsFilter = (
    search?: string,
    subjectTypesWhitelist?: Array<`${ClaimsSubjectType}`>,
) => string;
