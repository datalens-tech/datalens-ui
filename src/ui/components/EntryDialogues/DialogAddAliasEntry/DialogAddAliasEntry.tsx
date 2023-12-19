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

const b = block('dl-public-alert-dialog');
const i18n = I18n.keyset('component.dialog-rename-entry.view');

export interface DialogAddAliasEntryProps extends EntryDialogProps {
    entryId: string;
    alias: string | null;
}

export const DialogAddAliasEntry: React.FC<DialogAddAliasEntryProps> = ({
    entryId,
    visible,
    alias,
    onClose,
}) => {
    const [text, setText] = React.useState<string>(alias ?? '');
    const dispatch = useDispatch();

    function onCloseDialog() {
        onClose({status: EntryDialogResolveStatus.Close});
    }

    async function renameAlias(str: string | null) {
        let name = str;

        if (name !== null) {
            name = name.trim();
            if (name === '') name = null;
        }

        try {
            await getSdk().us.renameFavorite({entryId, name});
            onClose({status: EntryDialogResolveStatus.Success});
        } catch (error) {
            logger.logError('DialogAddAliasEntry: renameAlias failed', error);

            dispatch(
                showToast({
                    title: i18n('toast_rename-failed'),
                    name: 'DialogAddAliasEntry',
                    error,
                    withReport: true,
                }),
            );

            onClose({status: EntryDialogResolveStatus.Close});
        }
    }

    async function onApplyDialog() {
        renameAlias(text);
    }

    async function onResetAlias() {
        renameAlias(null);
    }

    function onChangeInput(str: string): void {
        setText(str);
    }

    const aliasExists = alias !== '' && alias !== null;

    const caption = aliasExists ? 'Изменить лейбл' : 'Добавить лейбл';

    return (
        <Dialog
            size="s"
            hasCloseButton={true}
            open={visible}
            onEnterKeyDown={onApplyDialog}
            onClose={onCloseDialog}
            disableFocusTrap={true}
        >
            <div className={b()}>
                <Dialog.Header caption={caption} />
                <Dialog.Body>
                    <div className={b('content')} data-qa="entry-dialog-content">
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
                    textButtonApply={'Сохранить'}
                    textButtonCancel={i18n('button_cancel')}
                >
                    {aliasExists && (
                        <Button
                            view="outlined-danger"
                            size="l"
                            disabled={false}
                            onClick={onResetAlias}
                        >
                            Удалить лейбл
                        </Button>
                    )}
                </Dialog.Footer>
            </div>
        </Dialog>
    );
};
