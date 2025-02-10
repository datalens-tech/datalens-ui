import {I18n} from 'i18n';
import type {GetRevisionsEntry} from 'shared/schema';

const i18n = I18n.keyset('component.dialog-revisions.view');

const REVISIONS_STATUSES_TEXTS = {
    published: i18n('label_status-tooltip-published'),
    draft: i18n('label_status-tooltip-draft'),
    current: i18n('label_status-tooltip-current'),
    notActual: i18n('label_status-tooltip-not-actual'),
};

export const isPublishedVersion = (entry: GetRevisionsEntry) => entry.revId === entry.publishedId;

export const isDraftVersion = (entry: GetRevisionsEntry) => entry.revId === entry.savedId;

export type RevisionStatusKey = keyof typeof REVISIONS_STATUSES_TEXTS;
export function getRevisionStatusKey(entry: GetRevisionsEntry): RevisionStatusKey {
    if (isPublishedVersion(entry)) {
        return 'published';
    }
    if (isDraftVersion(entry)) {
        return 'draft';
    }
    return 'notActual';
}

export function getRevisionStatus(entry: GetRevisionsEntry) {
    return REVISIONS_STATUSES_TEXTS[getRevisionStatusKey(entry)];
}
