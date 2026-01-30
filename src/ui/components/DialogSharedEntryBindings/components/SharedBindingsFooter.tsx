import React from 'react';

import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {DialogClassName} from '../constants';

import ArrowsRotateRightIcon from '@gravity-ui/icons/svgs/arrows-rotate-right.svg';

type SharedBindingsFooterProps = {
    isLoading: boolean;
    onRefresh: () => void;
    onClose: () => void;
    emptyList: boolean;
    onDelete: () => void;
};

const b = block(DialogClassName);

export const SharedBindingsFooter = ({
    isLoading,
    onRefresh,
    emptyList,
    onClose,
    onDelete,
}: SharedBindingsFooterProps) => {
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
            loading={isLoading}
            textButtonCancel={getSharedEntryMockText('cancel-bindings-dialog-delete')}
            onClickButtonApply={onDelete}
            onClickButtonCancel={onClose}
        >
            <Button loading={isLoading} view="outlined" size="l" onClick={onRefresh}>
                <Icon data={ArrowsRotateRightIcon} />
                {getSharedEntryMockText('bindings-dialog-delete-refresh-btn')}
            </Button>
        </Dialog.Footer>
    );
};
