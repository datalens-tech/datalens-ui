import {COLLECTIONS_PATHNAME, WORKBOOK_PATHNAME} from '../constants';

export const getEntityIdFromPathname = (isCollection = false) => {
    const pathnameParts = window.location.pathname.split('/').filter(Boolean);
    const entityPathnameIndex = pathnameParts.findIndex(
        (part) => part === (isCollection ? COLLECTIONS_PATHNAME : WORKBOOK_PATHNAME),
    );
    // Here we expect pathname like this: '/workbooks/${workbookId}/...'
    return entityPathnameIndex === -1 ? '' : pathnameParts[entityPathnameIndex + 1];
};
