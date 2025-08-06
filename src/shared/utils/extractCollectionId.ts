import {isEntryId} from '..';

const COLLECTION_ROUTE = 'collections';

function getCollectionId(str: string): string | null {
    const isIdResult = isEntryId(str);
    if (isIdResult) {
        return str;
    }
    return null;
}

export function extractCollectionId(input?: string): string | null {
    if (!input) {
        return null;
    }

    const [partOne, partTwo] = input.split('/').filter(Boolean);
    if (partOne === COLLECTION_ROUTE) {
        return getCollectionId(partTwo);
    }
    return null;
}
