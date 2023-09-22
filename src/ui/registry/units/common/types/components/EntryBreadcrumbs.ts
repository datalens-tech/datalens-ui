import {BreadcrumbsProps} from '@gravity-ui/uikit/build/esm/components/Breadcrumbs/Breadcrumbs';
import {GetEntryResponse} from 'shared/schema';

export type EntryBreadcrumbsProps = {
    renderRootContent?: BreadcrumbsProps['renderRootContent'];
    entry?: GetEntryResponse;
    workbookName?: string;
    openNavigationAction?: (startFromNavigation: string) => void;
};
