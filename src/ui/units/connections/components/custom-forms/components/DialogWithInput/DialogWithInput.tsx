import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Dialog, TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import type {DialogConnWithInputProps} from './types';

const i18n = I18n.keyset('connections.gsheet.view');

export const DialogWithInput = <T extends unknown>(props: DialogConnWithInputProps<T>) => {
    const {value, caption, textButtonApply, textButtonCancel, onClose} = props;
    const mounted = React.useRef(false);
    const [updatedValue, setUpdatedValue] = React.useState(value || '');
    const [loading, setLoading] = React.useState(false);
    const propsButtonApply: Partial<ButtonProps> = React.useMemo(() => {
        return {disabled: !updatedValue, loading};
    }, [updatedValue, loading]);

    const handleUpdate = React.useCallback((nextName: string) => {
        setUpdatedValue(nextName);
    }, []);

    const handleApply = React.useCallback(async () => {
        if (!updatedValue) {
            return;
        }

        switch (props.applyMode) {
            case 'sync': {
                const {onApply} = props;
                onApply(updatedValue);
                break;
            }
            case 'async': {
                const {onApply, onSuccess, onError} = props;
                setLoading(true);
                const data = await onApply(updatedValue);

                if (!mounted.current) {
                    return;
                }

                setLoading(false);

                if (data.error) {
                    onError?.(data.error);
                } else {
                    onSuccess?.(data);
                }
            }
        }
    }, [props, updatedValue, mounted]);

    React.useLayoutEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    return (
        <Dialog open={true} onClose={onClose} size="s" onEnterKeyDown={handleApply}>
            <Dialog.Header caption={caption} />
            <Dialog.Body>
                <TextInput
                    value={updatedValue}
                    autoFocus={true}
                    disabled={loading}
                    onUpdate={handleUpdate}
                />
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApply}
                textButtonApply={textButtonApply || i18n('button_apply')}
                textButtonCancel={textButtonCancel || i18n('button_cancel')}
                propsButtonApply={propsButtonApply as ButtonProps}
            />
        </Dialog>
    );
};
