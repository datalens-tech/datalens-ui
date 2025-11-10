export const Attachment = {
    TARGET: 'target',
    SOURCE: 'source',
} as const;

export type AttachmentValue = (typeof Attachment)[keyof typeof Attachment];

// TODO texts in CHARTS-11999
export const ObjectsListTitles: Record<AttachmentValue, string> = {
    target: 'Воркбуки',
    source: 'Подключения',
};
