import {EntryScope} from 'shared';

export const getScopeTypeIcon = (scope: string) => {
    switch (scope) {
        case EntryScope.Folder:
            return 'folder';
        case EntryScope.Widget:
        case 'chart':
            return 'chart-wizard';
        case EntryScope.Dataset:
            return 'dataset';
        case EntryScope.Dash:
        case 'dashboard':
            return 'dashboard';
        case 'monitoring':
            return 'editor';
        case 'broken':
            return 'broken';
        case 'connection':
            return 'connection';
        default:
            return null;
    }
};
