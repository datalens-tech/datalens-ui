import type {History} from 'history';

export type OnNavigationCreateMenuClick = (args: {
    type: string;
    history: History;
    path?: string;
    openOnlyCollectionsDialog?: (type: string) => void;
    closeNavigation?: () => void;
}) => void;
