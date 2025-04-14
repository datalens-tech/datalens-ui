import type {GetRevisionsEntry} from 'shared/schema';

export const snakeToCamel = (s: string) =>
    s.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase());

export function isEntryLatest(entry: GetRevisionsEntry) {
    return entry.publishedId === entry.revId;
}

function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        console.warn('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
}

export function copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(
        () => {
            console.warn('Async: Copying to clipboard was successful!');
        },
        (err) => {
            console.error('Async: Could not copy text: ', err);
        },
    );
}

/** Uses to get path name for page that does not contains a created entry. */
export function getFullPathName(args: {
    /** Base part of the path that follows immediately after `/workbook` part. It should start with `/`. */
    base: string;
    /** Workbook id. Adds `/workbook` part to the start of result path name as well if specified. */
    workbookId?: string;
}) {
    const {base, workbookId} = args;
    const baseWithSearch = `${base}${location.search}`;
    return workbookId ? `/workbooks/${workbookId}${baseWithSearch}` : baseWithSearch;
}
