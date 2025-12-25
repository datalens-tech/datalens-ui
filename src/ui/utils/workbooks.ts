import {COLLECTIONS_PATHNAME, WORKBOOK_PATHNAME} from 'ui/constants';
import {getLocation} from 'ui/navigation';

export const getEntityIdFromPathname = (isCollection = false) => {
    const path = getLocation().path;
    const entityPathnameIndex = path.findIndex(
        (part) => part === (isCollection ? COLLECTIONS_PATHNAME : WORKBOOK_PATHNAME),
    );
    // Here we expect pathname like this: '/workbooks/${workbookId}/...'
    return entityPathnameIndex === -1 ? '' : path[entityPathnameIndex + 1];
};
