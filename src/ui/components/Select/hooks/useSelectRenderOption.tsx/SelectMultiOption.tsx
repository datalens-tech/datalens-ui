import React from 'react';

import {Button, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {DefaultOption, DefaultOptionProps} from '../../components/DefaultOption/DefaultOption';

import './SelectMultiOption.scss';

const i18n = I18n.keyset('components.common.YCSelect');
const b = block('select-multi-option');

export type OptionSelectionMode = 'only' | 'except';

type MultiOptionProps<T = any> = {
    onClick: (value: string, mode: OptionSelectionMode) => void;
} & DefaultOptionProps<T>;

export const SelectMultiOption = (props: MultiOptionProps) => {
    const [mode, setMode] = React.useState<'only' | 'except'>('only');

    const {option, onClick} = props;

    return (
        <Flex className={b()} alignItems={'center'} justifyContent={'space-between'}>
            <DefaultOption option={option} />
            <Button
                className={b('action-button')}
                size="s"
                onFocus={(e: React.FocusEvent<HTMLButtonElement, HTMLElement>) =>
                    e?.relatedTarget?.focus()
                }
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(option.value, mode);
                    setMode(mode === 'only' ? 'except' : 'only');
                }}
            >
                {i18n(`item_${mode}`)}
            </Button>
        </Flex>
    );
};
