import type {CurrentPageEntry} from 'components/Navigation/types';

export type AsideHeaderState = {
    panelVisible: boolean;
    startFromNavigation: string;
    place: string;
    asideHeaderData: AsideHeaderData;
    currentPageEntry: CurrentPageEntry | null;
    settings: AsideHeaderSettings;
    isCompact: boolean;
    isHidden: boolean;
};

export type AsideHeaderSettings = {
    withHelpCenter: boolean;
    withNavigation: boolean;
    navigationType: 'inline' | 'aside';
};

export type AsideHeaderData = {
    size: number;
};

export type OpenNavigationParams = {
    place?: string;
    startFromNavigation?: string;
};
