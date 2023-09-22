export const snakeToCamel = (s) => s.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase());

export function isEntryLatest(entry) {
    return entry.savedId === entry.revId;
}

function fallbackCopyTextToClipboard(text) {
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

export function copyTextToClipboard(text) {
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
