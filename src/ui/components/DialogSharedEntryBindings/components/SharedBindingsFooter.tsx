import React from 'react';

import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {DialogClassName} from '../constants';

import ArrowsRotateRightIcon from '@gravity-ui/icons/svgs/arrows-rotate-right.svg';

type SharedBindingsFooterProps = {
    isLoading: boolean;
    onRefresh: () => void;
    onClose: () => void;
    emptyList: boolean;
    onDelete: () => void;
};

const i18n = I18n.keyset('component.dialog-shared-entry-bindings.view');
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
            textButtonApply={i18n('apply-delete')}
            propsButtonApply={{
                view: 'outlined-danger',
            }}
            propsButtonCancel={{
                view: 'flat',
            }}
            className={b('footer', {'empty-list': emptyList})}
            loading={isLoading}
            textButtonCancel={i18n('cancel-delete')}
            onClickButtonApply={onDelete}
            onClickButtonCancel={onClose}
        >
            <Button loading={isLoading} view="outlined" size="l" onClick={onRefresh}>
                <Icon data={ArrowsRotateRightIcon} />
                {i18n('refresh-btn')}
            </Button>
        </Dialog.Footer>
    );
};
