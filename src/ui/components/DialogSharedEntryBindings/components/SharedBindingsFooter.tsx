import React from 'react';

import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {getSdk} from 'ui/libs/schematic-sdk';
import type {AppDispatch} from 'ui/store';
import {showToast} from 'ui/store/actions/toaster';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {DialogClassName} from '../constants';
import type {SharedEntry} from '../types';

import ArrowsRotateRightIcon from '@gravity-ui/icons/svgs/arrows-rotate-right.svg';

type SharedBindingsFooterProps = {
    isLoading: boolean;
    onRefresh: () => void;
    onClose: () => void;
    emptyList: boolean;
    entry: SharedEntry;
    onDeleteSuccess?: () => void;
};

const b = block(DialogClassName);

export const SharedBindingsFooter = ({
    entry,
    isLoading,
    onRefresh,
    emptyList,
    onClose,
    onDeleteSuccess,
}: SharedBindingsFooterProps) => {
    const dispatch: AppDispatch = useDispatch();
    const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);

    const onDelete = React.useCallback(async () => {
        setIsLoadingDelete(true);
        try {
            await getSdk().sdk.mix.deleteEntry({
                entryId: entry.entryId,
                scope: entry.scope,
            });
            setIsLoadingDelete(false);
            onDeleteSuccess?.();
        } catch (error) {
            setIsLoadingDelete(false);
            dispatch(
                showToast({
                    title: error.message,
                    error,
                }),
            );
        }
    }, [onDeleteSuccess, entry, dispatch]);

    return (
        <Dialog.Footer
            textButtonApply={getSharedEntryMockText('apply-bindings-dialog-delete')}
            propsButtonApply={{
                view: 'outlined-danger',
            }}
            propsButtonCancel={{
                view: 'flat',
            }}
            className={b('footer', {'empty-list': emptyList})}
            loading={isLoading || isLoadingDelete}
            textButtonCancel={getSharedEntryMockText('cancel-bindings-dialog-delete')}
            onClickButtonApply={onDelete}
            onClickButtonCancel={onClose}
        >
            <Button
                loading={isLoading || isLoadingDelete}
                view="outlined"
                size="l"
                onClick={onRefresh}
            >
                <Icon data={ArrowsRotateRightIcon} />
                {getSharedEntryMockText('bindings-dialog-delete-refresh-btn')}
            </Button>
        </Dialog.Footer>
    );
};
