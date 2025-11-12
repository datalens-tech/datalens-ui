import type {mockSharedEntriesTexts} from '../../../i18n-keysets/shared-entries.view/ru';

export const Attachment = {
    TARGET: 'target',
    SOURCE: 'source',
} as const;

export type AttachmentValue = (typeof Attachment)[keyof typeof Attachment];

export const ObjectsListTitles: Record<AttachmentValue, keyof typeof mockSharedEntriesTexts> = {
    target: 'entries-list-title-workbook',
    source: 'entries-list-title-source',
};

export const SEARCH_DELAY = 1000;
