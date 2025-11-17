import type React from 'react';
import type {MouseEventHandler} from 'react';

import type {GetCollectionBreadcrumbsResponse, GetEntryResponse} from 'shared/schema';

export type EntryBreadcrumbsProps = {
    renderRootContent?: (item: BreadcrumbsItem) => React.ReactNode;
    entry?: GetEntryResponse;
    workbookName?: string;
    //TODO delete after CHARTS-12145
    workbookBreadcrumbs?: GetCollectionBreadcrumbsResponse | null;
    entityBreadcrumbs?: GetCollectionBreadcrumbsResponse | null;
    openNavigationAction?: (startFromNavigation: string) => void;
    endContent?: React.ReactNode;
};

export type BreadcrumbsItem = {
    text: string;
    href?: string;
    path?: string;
    action?: MouseEventHandler<HTMLAnchorElement>;
};
