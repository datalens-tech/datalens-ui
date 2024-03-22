import React from 'react';

import {Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './CreateEntityDialog.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collections-structure-create-entity-dialog');

export type Props = {
    open: boolean;
    title: string;
    isLoading: boolean;
    onApply: (title: string) => Promise<unknown>;
    onClose: () => void;
};

export const CreateEntityDialog = React.memo<Props>(
    ({open, title, isLoading, onApply, onClose}) => {
        const [titleValue, setTitleValue] = React.useState('');

        const handleApply = React.useCallback(() => {
            onApply(titleValue).then(() => {
                onClose();
            });
        }, [onApply, onClose, titleValue]);

        React.useEffect(() => {
            if (open) {
                setTitleValue('');
            }
        }, [open]);

        return (
            <Dialog
                className={b()}
                size="s"
                open={open}
                onClose={onClose}
                onEnterKeyDown={handleApply}
            >
                <Dialog.Header caption={title} />
                <Dialog.Body>
                    <div className={b('field')}>
                        <div className={b('title')}>{i18n('label_title')}</div>
                        <TextInput value={titleValue} onUpdate={setTitleValue} autoFocus />
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    onClickButtonApply={handleApply}
                    textButtonApply={i18n('action_create')}
                    propsButtonApply={{
                        disabled: !titleValue,
                    }}
                    textButtonCancel={i18n('action_cancel')}
                    loading={isLoading}
                />
            </Dialog>
        );
    },
);

CreateEntityDialog.displayName = 'CreateEntityDialog';
