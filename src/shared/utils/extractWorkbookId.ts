import {isEntryId} from '..';

const WORKBOOK_ROUTE = 'workbooks';

function getWorkbookId(str: string): string | null {
    const isIdResult = isEntryId(str);
    if (isIdResult) {
        return str;
    }
    return null;
}

export function extractWorkbookId(input?: string): string | null {
    if (!input) {
        return null;
    }

    const [partOne, partTwo] = input.split('/').filter(Boolean);
    if (partOne === WORKBOOK_ROUTE) {
        return getWorkbookId(partTwo);
    }
    return null;
}
