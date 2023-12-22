import {BreadcrumbsProps} from '@gravity-ui/uikit/build/esm/components/Breadcrumbs/Breadcrumbs';
import {GetEntryResponse, GetWorkbookResponse} from 'shared/schema';

export type EntryBreadcrumbsProps = {
    renderRootContent?: BreadcrumbsProps['renderRootContent'];
    entry?: GetEntryResponse;
    workbook: GetWorkbookResponse | null;
    openNavigationAction?: (startFromNavigation: string) => void;
};
