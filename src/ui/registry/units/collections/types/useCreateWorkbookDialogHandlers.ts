import type {ProcessStatus} from 'shared/types/meta-manager';
import type {CreateWorkbookDialogProps} from 'ui/components/CollectionsStructure/CreateWorkbookDialog/CreateWorkbookDialog';
import type {RefreshPageAfterImport} from 'ui/units/collections/hooks/useRefreshPageAfterImport';

export type RefreshPageOptions = {
    refreshPageAfterImport: RefreshPageAfterImport;
    initialImportStatus: ProcessStatus | null;
};

export type UseCreateWorkbookDialogHandlers = () => {
    handleOpenCreateDialogWithConnection: () => void;
    handleOpenCreateDialog: (
        defaultView?: CreateWorkbookDialogProps['defaultView'],
        options?: {importId?: string} & RefreshPageOptions,
    ) => void;
    handleOpenCreatePublicGalleryDialog?: ({
        publicGalleryId,
        refreshPageAfterImport,
        initialImportStatus,
    }: {publicGalleryId: string} & RefreshPageOptions) => void;
};
