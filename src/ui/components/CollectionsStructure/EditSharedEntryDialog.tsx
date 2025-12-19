import React from 'react';

import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import {getSdk} from 'ui/libs/schematic-sdk';
import type {AppDispatch} from 'ui/store';

import DialogManager from '../../components/DialogManager/DialogManager';

import {NewTitleDialog} from './CollectionStructureDialog/NewTitleDialog/NewTitleDialog';

const i18n = I18n.keyset('component.collections-structure');

type Props = {
    entryId: string;
    title: string;
    open: boolean;
    onClose: () => void;
    onApply?: () => void;
};

export const DIALOG_EDIT_SHARED_ENTRY = Symbol('DIALOG_EDIT_SHARED_ENTRY');

export type OpenDialogEditSharedEntryArgs = {
    id: typeof DIALOG_EDIT_SHARED_ENTRY;
    props: Props;
};

export const EditSharedEntryDialog: React.FC<Props> = ({
    entryId,
    open,
    title,
    onClose,
    onApply: propsOnApply,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const [isLoading, setIsLoading] = React.useState(false);

    const onApply = async (name: string) => {
        setIsLoading(true);
        try {
            await getSdk().sdk.us.renameEntry({
                entryId,
                name,
            });
            setIsLoading(false);
            propsOnApply?.();
        } catch (error) {
            setIsLoading(false);
            dispatch(
                showToast({
                    title: error.message,
                    error,
                }),
            );
        }
    };

    return (
        <NewTitleDialog
            open={open}
            isLoading={isLoading}
            defaultTitle={title}
            onApply={onApply}
            onClose={onClose}
            textButtonApply={i18n('action_save')}
        />
    );
};

DialogManager.registerDialog(DIALOG_EDIT_SHARED_ENTRY, EditSharedEntryDialog);
