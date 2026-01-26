export const Attachment = {
    TARGET: 'target',
    SOURCE: 'source',
} as const;

export type AttachmentValue = (typeof Attachment)[keyof typeof Attachment];

export const ObjectsListTitles: Record<AttachmentValue, string> = {
    source: 'list-title-workbook',
    target: 'list-title-connection',
};

export const SEARCH_DELAY = 1000;

export const DialogClassName = 'dialog-shared-entries-binding';
