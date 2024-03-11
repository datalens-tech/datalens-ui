import {BreadcrumbsProps} from '@gravity-ui/uikit/build/esm/components/Breadcrumbs/Breadcrumbs';
import {GetCollectionBreadcrumbsResponse, GetEntryResponse} from 'shared/schema';

export type EntryBreadcrumbsProps = {
    renderRootContent?: BreadcrumbsProps['renderRootContent'];
    entry?: GetEntryResponse;
    workbookName?: string;
    workbookBreadcrumbs?: GetCollectionBreadcrumbsResponse | null;
    openNavigationAction?: (startFromNavigation: string) => void;
};
