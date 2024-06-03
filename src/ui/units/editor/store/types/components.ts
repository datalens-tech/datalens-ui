import type {RevisionAction} from '../../types/revisions';

export type ButtonSaveComponentData = {
    progress: boolean;
};

export type DialogRevisionsComponentData = {
    progress: null | {
        action: RevisionAction;
        revId: string;
    };
};
