import type {GetRevisionsEntry} from '../../../../shared/schema';

export type RevisionEntry = GetRevisionsEntry;

export enum RevisionAction {
    Open = 'open',
    Publish = 'publish',
    Reset = 'reset',
}
