import type {GetEntryResponse, GetPublicationPreviewEntry} from 'shared/schema';

import type {DIALOG_STATUS} from './constants';

export type EntryData = GetEntryResponse;
export type EntryRelation = GetPublicationPreviewEntry;

export type EntryDataExtended = EntryData & {
    tooltip: string;
    checked?: boolean;
    disabled: boolean;
};

export type EntryRelationExtended = EntryRelation & {
    tooltip: string;
    checked?: boolean;
    disabled: boolean;
};

export type ValidationErrors = {
    link: string | null;
    text: string | null;
};

export type EntryAuthorData = {
    text?: string;
    link?: string;
};

export type EntryUnversionedData =
    | {
          publicAuthor?: EntryAuthorData;
      }
    | undefined;

export type DialogPublicCloseCallback = (
    status: 'success' | 'close' | unknown,
    publish: boolean,
) => void;

export type DialogStatus = (typeof DIALOG_STATUS)[keyof typeof DIALOG_STATUS];

export type State = {
    status: DialogStatus;
    entry: EntryDataExtended;
    relations: Record<string, EntryRelationExtended>;
    groups: Record<string, EntryRelationExtended[]>;
    currentEntryChecked: boolean;
    currentEntryDisabled: boolean;
    currentEntryTooltip: string;
    progress: boolean;
    applyCounter: number;
    refetchCounter: number;
    onceChangePublish: boolean;
    onceChangeUnpublish: boolean;
    validationErrors: ValidationErrors;
    entryAuthor: {
        link: string;
        text: string;
    };
    error: {
        title: string;
        description?: string;
    };
    hasLockedEntries: boolean;
    onClose: DialogPublicCloseCallback;
};

export const DIALOG_PUBLIC_SET_LOADING = Symbol('dialogPublic/SET_LOADING');
type SetLoadingAction = {
    type: typeof DIALOG_PUBLIC_SET_LOADING;
};

export const DIALOG_PUBLIC_SET_REFETCH = Symbol('dialogPublic/SET_REFETCH');
type SetRefetchAction = {
    type: typeof DIALOG_PUBLIC_SET_REFETCH;
};

export const DIALOG_PUBLIC_SET_APPLY = Symbol('dialogPublic/SET_APPLY');
type SetApplyAction = {
    type: typeof DIALOG_PUBLIC_SET_APPLY;
};

export const DIALOG_PUBLIC_SET_FAILED = Symbol('dialogPublic/SET_FAILED');
type SetFailedAction = {
    type: typeof DIALOG_PUBLIC_SET_FAILED;
    payload?: {
        error: {
            title: string;
            description?: string;
        };
    };
};

export const DIALOG_PUBLIC_SET_SUCCESS = Symbol('dialogPublic/SET_SUCCESS');
type SetSuccessAction = {
    type: typeof DIALOG_PUBLIC_SET_SUCCESS;
};

export const DIALOG_PUBLIC_SET_PUBLISH_UNPUBLISH_ONCE = Symbol(
    'dialogPublic/SET_PUBLISH_UNPUBLISH_ONCE',
);
type SetPublishUnpublishOnceAction = {
    type: typeof DIALOG_PUBLIC_SET_PUBLISH_UNPUBLISH_ONCE;
    payload: {
        onceChangePublish?: boolean;
        onceChangeUnpublish?: boolean;
    };
};

export const DIALOG_PUBLIC_CHANGE_RELATIONS_ENTRIES = Symbol(
    'dialogPublic/CHANGE_RELATIONS_ENTRIES',
);
type ChangeRelationsEntriesAction = {
    type: typeof DIALOG_PUBLIC_CHANGE_RELATIONS_ENTRIES;
    payload: {
        onceChangePublish?: boolean;
        onceChangeUnpublish?: boolean;
        relations: Array<EntryRelationExtended>;
        nextChecked: boolean;
    };
};

export const DIALOG_PUBLIC_CHANGE_STATE = Symbol('dialogPublic/CHANGE_STATE');
type ChangeStateAction = {
    type: typeof DIALOG_PUBLIC_CHANGE_STATE;
    payload: State;
};

export const DIALOG_PUBLIC_CHANGE_ENTRY_AUTHOR = Symbol('dialogPublic/CHANGE_ENTRY_AUTHOR');
type ChangeEntryAuthorAction = {
    type: typeof DIALOG_PUBLIC_CHANGE_ENTRY_AUTHOR;
    payload: {
        link?: string;
        text?: string;
    };
};

export type Action =
    | SetLoadingAction
    | SetRefetchAction
    | SetApplyAction
    | SetFailedAction
    | SetSuccessAction
    | SetPublishUnpublishOnceAction
    | ChangeRelationsEntriesAction
    | ChangeStateAction
    | ChangeEntryAuthorAction;
