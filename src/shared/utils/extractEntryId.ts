import {ENTRY_ID_LENGTH, ENTRY_ROUTES, ENTRY_SLUG_SEPARATOR, WIZARD_ROUTE, isEntryId} from '..';

function getEntryId(str: string): string | null {
    const possibleEntryId = str.slice(0, ENTRY_ID_LENGTH);
    const isEntryIdResult = isEntryId(possibleEntryId);
    if (isEntryIdResult && str.length === ENTRY_ID_LENGTH) {
        return possibleEntryId;
    }
    if (isEntryIdResult && str[ENTRY_ID_LENGTH] === ENTRY_SLUG_SEPARATOR) {
        return possibleEntryId;
    }
    return null;
}

export function extractEntryId({
    routes = ENTRY_ROUTES,
    input,
}: {
    routes?: string[];
    input?: string;
}): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const [partOne, partTwo, partThree] = input.split('/').filter(Boolean);

    const partOneIsEntryPath = routes.some((route) => partOne === route);

    if (partThree === WIZARD_ROUTE && partTwo === 'new') {
        return getEntryId(partOne);
    }
    if (partTwo && partOneIsEntryPath) {
        return getEntryId(partTwo);
    }
    if (partOne && partTwo !== 'new' && !partOneIsEntryPath) {
        return getEntryId(partOne);
    }
    return null;
}
