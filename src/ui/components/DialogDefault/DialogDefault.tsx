import React from 'react';

import {
    Dialog,
    type DialogFooterProps,
    type DialogHeaderProps,
    type DialogProps,
} from '@gravity-ui/uikit';
import type {AppDispatch} from 'ui/store';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';

import DialogManager from '../DialogManager/DialogManager';

export type DialogDefaultProps = {
    onApply?: () => void;
    onCancel: () => void;
    message: React.ReactNode;
    confirmOnEnterPress?: boolean;
} & Pick<
    DialogFooterProps,
    'propsButtonApply' | 'propsButtonCancel' | 'textButtonApply' | 'textButtonCancel' | 'loading'
> &
    Pick<DialogProps, 'size' | 'className' | 'open'> &
    Pick<DialogHeaderProps, 'caption'>;

export enum DialogConfirmApplyStatus {
    Loading = 'loading',
    Successed = 'successed',
    Failed = 'failed',
}

export const DIALOG_DEFAULT = Symbol('DIALOG_DEFAULT');
export type OpenDialogDefaultArgs = {
    id: typeof DIALOG_DEFAULT;
    props: DialogDefaultProps;
};

export const openDialogDefault = ({
    onCancel,
    onApply,
    ...props
}: Omit<DialogDefaultProps, 'onCancel' | 'open'> & {onCancel?: () => void}) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_DEFAULT,
                props: {
                    ...props,
                    open: true,
                    onCancel: () => {
                        onCancel?.();
                        dispatch(closeDialog());
                    },
                    onApply: onApply
                        ? () => {
                              onApply?.();
                              dispatch(closeDialog());
                          }
                        : undefined,
                },
            }),
        );
    };
};

export const DialogDefault = (props: DialogDefaultProps) => {
    const {
        message,
        confirmOnEnterPress,
        onApply,
        onCancel,
        className,
        open,
        caption,
        textButtonApply,
        textButtonCancel,
        propsButtonApply,
        propsButtonCancel,
        size,
        loading,
    } = props;

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            onEnterKeyDown={confirmOnEnterPress ? onApply : undefined}
            size={size}
            className={className}
        >
            {caption && <Dialog.Header caption={caption} />}
            <Dialog.Body>{message}</Dialog.Body>
            <Dialog.Footer
                textButtonApply={textButtonApply}
                textButtonCancel={textButtonCancel}
                propsButtonApply={propsButtonApply}
                propsButtonCancel={propsButtonCancel}
                onClickButtonApply={onApply}
                onClickButtonCancel={onCancel}
                loading={loading}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_DEFAULT, DialogDefault);
