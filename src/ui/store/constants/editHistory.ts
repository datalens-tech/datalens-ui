export const EDIT_HISTORY_ACTION = {
    REDO: 'redo',
    UNDO: 'undo',
} as const;

export type EditHistoryActionType = (typeof EDIT_HISTORY_ACTION)[keyof typeof EDIT_HISTORY_ACTION];
