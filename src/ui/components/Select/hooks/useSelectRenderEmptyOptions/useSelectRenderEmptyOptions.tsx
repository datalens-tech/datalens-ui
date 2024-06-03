import React from 'react';

import type {SelectProps} from '@gravity-ui/uikit';
import {Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import '../../styles/SelectUtil.scss';

const i18n = I18n.keyset('dash.control-dialog.edit');

const b = block('select-empty-options');

export type UseSelectRenderEmptyOptionsProps = {
    emptyOptionsText?: string;
} & Pick<SelectProps, 'renderEmptyOptions'>;

export const useSelectRenderEmptyOptions = ({
    emptyOptionsText,
    renderEmptyOptions,
}: UseSelectRenderEmptyOptionsProps) => {
    const renderEmptyOptionsHandler = React.useCallback(
        () => (
            <Flex alignItems="center" className={b()}>
                {emptyOptionsText || i18n('text_empty-items')}
            </Flex>
        ),
        [emptyOptionsText],
    );

    return renderEmptyOptions || renderEmptyOptionsHandler;
};
