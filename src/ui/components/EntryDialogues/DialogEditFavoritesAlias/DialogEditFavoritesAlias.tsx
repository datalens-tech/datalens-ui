import React from 'react';

import {Button, Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import logger from 'ui/libs/logger';
import {getSdk} from 'ui/libs/schematic-sdk';
import {showToast} from 'ui/store/actions/toaster';

import {EntryDialogResolveStatus} from '../constants';
import {EntryDialogProps} from '../types';

import './DialogEditFavoritesAlias.scss';

const b = block('dl-edit-favorites-alias');
const i18n = I18n.keyset('component.dialog-edit-favorites-alias.view');

export interface DialogEditFavoritesAliasProps extends EntryDialogProps {
    entryId: string;
    alias: string | null;
}

export const DialogEditFavoritesAlias: React.FC<DialogEditFavoritesAliasProps> = ({
    entryId,
    visible,
    alias,
    onClose,
}) => {
    const [text, setText] = React.useState<string>(alias ?? '');
    const dispatch = useDispatch();

    const onCloseDialog = () => {
        onClose({status: EntryDialogResolveStatus.Close});
    };

    const renameAlias = async (str: string | null) => {
        let name = str;

        if (name !== null) {
            name = name.trim();
            if (name === '') name = null;
        }

        if (name === alias) {
            onCloseDialog();
        } else {
            try {
                await getSdk().us.renameFavorite({entryId, name});
                onClose({status: EntryDialogResolveStatus.Success});
            } catch (error) {
                logger.logError('DialogEditFavoritesAlias: renameAlias failed', error);

                dispatch(
                    showToast({
                        title: i18n('toast_rename-favorites-alias-failed'),
                        name: 'DialogEditFavoritesAlias',
                        error,
                        withReport: true,
                    }),
                );

                onCloseDialog();
            }
        }
    };

    const onApplyDialog = () => {
        renameAlias(text);
    };

    const onResetAlias = () => {
        renameAlias(null);
    };

    const onChangeInput = (str: string): void => {
        setText(str);
    };

    const aliasExists = Boolean(alias);
    const caption = aliasExists ? i18n('caption_rename') : i18n('caption_add');

    return (
        <Dialog
            size="s"
            hasCloseButton={true}
            open={visible}
            onEnterKeyDown={onApplyDialog}
            onClose={onCloseDialog}
            disableFocusTrap={true}
        >
            <Dialog.Header caption={caption} />
            <Dialog.Body>
                <div className={b('content')}>
                    <TextInput
                        autoFocus={true}
                        size="l"
                        onUpdate={onChangeInput}
                        placeholder={i18n('label_placeholder')}
                        value={text}
                        hasClear={true}
                    />
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onCloseDialog}
                onClickButtonApply={onApplyDialog}
                textButtonApply={i18n('button_apply')}
                textButtonCancel={i18n('button_cancel')}
            >
                {aliasExists && (
                    <Button view="outlined-danger" size="l" disabled={false} onClick={onResetAlias}>
                        {i18n('button_delete')}
                    </Button>
                )}
            </Dialog.Footer>
        </Dialog>
    );
};
