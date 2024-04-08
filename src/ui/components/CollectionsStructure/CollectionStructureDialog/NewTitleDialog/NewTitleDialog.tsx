import React from 'react';

import {Dialog, TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    isLoading: boolean;
    defaultTitle: string;
    textButtonApply: string;
    onApply: (title: string) => void;
    onClose: () => void;
};

export const NewTitleDialog = React.memo<Props>(
    ({open, isLoading, defaultTitle, textButtonApply, onApply, onClose}) => {
        const [titleValue, setTitleValue] = React.useState(defaultTitle);

        const handleApply = React.useCallback(() => {
            if (titleValue) {
                onApply(titleValue);
                onClose();
            }
        }, [onApply, onClose, titleValue]);

        React.useEffect(() => {
            if (open) {
                setTitleValue(defaultTitle);
            }
        }, [open, defaultTitle]);

        return (
            <Dialog size="s" open={open} onClose={onClose} onEnterKeyDown={handleApply}>
                <Dialog.Header caption={i18n('label_title')} />
                <Dialog.Body>
                    <TextInput value={titleValue} onUpdate={setTitleValue} autoFocus />
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    onClickButtonApply={handleApply}
                    textButtonApply={textButtonApply}
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

NewTitleDialog.displayName = 'NewTitleDialog';
