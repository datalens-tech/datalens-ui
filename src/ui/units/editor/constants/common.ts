import {EDITOR_TYPE} from 'shared/constants';

export enum EditorUrls {
    Base = '/editor',
    NewEntry = '/editor/new',
    EntryDraft = '/editor/draft',
}

export enum EditorUrlParams {
    New = 'new',
    Draft = 'draft',
}

export enum Status {
    Loading = 'loading',
    Failed = 'failed',
    Success = 'success',
}

export const PANE_VIEWS = {
    EDITOR: 'Editor',
    PREVIEW: 'Preview',
    CONSOLE: 'Console',
};

export const MODULE_TYPE = 'module';

export const DEFAULT_TAB_ID = 'prepare';

export const TIMESTAMP_FORMAT = 'DD.MM.YYYY HH:mm:ss';

export const THEME = {
    LIGHT: 'light',
    DARK: 'dark',
};

export const UPDATE_ENTRY_MODE = {
    PUBLISH: 'publish',
    SAVE: 'save',
};

export const ENTRY_ACTION = {
    SAVE_AS_COPY: 'saveAsCopy',
    SAVE_AS_DRAFT: 'saveAsDraft',
};

export const DIALOG_RESOLVE_STATUS = {
    SUCCESS: 'success',
    CLOSE: 'close',
};

export const TOASTER_TYPE = {
    SUCCESS: 'success',
    ERROR: 'danger',
};

export const UNRELEASED_MODULE_MARK = '@saved';

export const EVENT_DRAW_PREVIEW = 'editor-draw-preview';

export const getEmptyTemplateType = () => EDITOR_TYPE.GRAVITY_CHARTS_NODE;
