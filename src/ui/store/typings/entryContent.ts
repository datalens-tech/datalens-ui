import type {GetEntryResponse, GetRevisionsEntry} from '../../../shared/schema';
import type {EntryContentState} from '../reducers/entryContent';

export enum RevisionsMode {
    Opened = 'opened',
    Closed = 'closed',
}

export enum RevisionsListMode {
    Collapsed = 'collapsed',
    Expanded = 'expanded',
}

export interface EntryGlobalState extends GetEntryResponse {
    revisionsMode?: RevisionsMode;
    revisionsListMode?: RevisionsListMode;
    revisions?: Array<GetRevisionsEntry>;
    currentRevId?: string;
    hasRevisionsNextPage?: boolean;
    revisionsLoadingStatus?: EntryContentState['revisionsLoadingStatus'];
}
