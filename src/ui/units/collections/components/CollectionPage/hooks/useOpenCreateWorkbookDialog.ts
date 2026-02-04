import React from 'react';

import {useHistory, useLocation} from 'react-router-dom';
import {registry} from 'ui/registry';

import type {RefreshPageAfterImport} from '../../../hooks/useRefreshPageAfterImport';
import {PUBLIC_GALLERY_ID_SEARCH_PARAM} from '../../constants';

type LocationImportState = {
    importId?: string;
};

type Args = {
    search: string;
    refreshPageAfterImport: RefreshPageAfterImport;
};

export const useOpenCreateWorkbookDialog = ({search, refreshPageAfterImport}: Args) => {
    const {state: locationState} = useLocation<LocationImportState>();

    const history = useHistory();
    const {useCreateWorkbookDialogHandlers} = registry.collections.functions.getAll();
    const {handleOpenCreateDialog, handleOpenCreatePublicGalleryDialog} =
        useCreateWorkbookDialogHandlers();

    React.useEffect(() => {
        const importId = locationState && locationState?.importId;
        if (importId) {
            // after the replaceState, the page is re-rendered,
            // so it is important that the dialog is opened after that.
            // clearing the state is necessary so that it does not persist when the page is reloaded.
            history.replace({state: {...locationState, importId: undefined}});
            handleOpenCreateDialog('import', {
                importId,
                refreshPageAfterImport,
                initialImportStatus: 'pending',
            });
        }
    }, [
        handleOpenCreateDialog,
        history,
        locationState,
        locationState?.importId,
        refreshPageAfterImport,
    ]);

    React.useEffect(() => {
        const searchParams = new URLSearchParams(search);
        const publicGalleryId = searchParams.get(PUBLIC_GALLERY_ID_SEARCH_PARAM);

        if (!publicGalleryId) {
            return;
        }

        handleOpenCreatePublicGalleryDialog?.({
            publicGalleryId,
            refreshPageAfterImport,
            initialImportStatus: null,
        });
    }, [refreshPageAfterImport, search, handleOpenCreatePublicGalleryDialog]);
};
