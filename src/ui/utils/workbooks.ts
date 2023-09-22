import {WORKBOOK_PATHNAME} from '../constants';

export const getWorkbookIdFromPathname = () => {
    const pathnameParts = window.location.pathname.split('/').filter(Boolean);
    const workbookPathnameIndex = pathnameParts.findIndex((part) => part === WORKBOOK_PATHNAME);
    // Here we expect pathname like this: '/workbooks/${workbookId}/...'
    return workbookPathnameIndex === -1 ? '' : pathnameParts[workbookPathnameIndex + 1];
};
