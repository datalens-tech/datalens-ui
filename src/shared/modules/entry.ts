export function getEntryNameByKey({key, index}: {key: string; index: number}) {
    let name = '';

    if (key && typeof key === 'string') {
        let pathSplit = key.split('/');
        pathSplit = pathSplit.filter(Boolean);

        if (pathSplit.length !== 0) {
            name = pathSplit.splice(index, 1)[0];
        }
    }

    return name;
}

export function normalizeDestination(destination = '') {
    // Delete extreme slashes, and add one to the right
    return destination.replace(/^\/+|\/+$/g, '') + '/';
}

export function isUsersFolder(key = '') {
    return key.toLowerCase() === 'users/';
}

export function isFavoritesAliasAvailable(alias?: string | null) {
    return alias !== null && alias !== undefined && alias !== '';
}
