import React from 'react';

import {Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {LineWidth} from 'shared';
import NumberInput from 'ui/components/NumberFormatSettings/NumberInput/NumberInput';

import {LineWidthSelect} from '../../../LineWidthSelect/LineWidthSelect';

import './DialogLineWidth.scss';

const b = block('dl-dialog-line-width');

interface DialogLineWidthProps {
    value: number | null;
    onChange: (lineWidth: LineWidth) => void;
}

export const DialogLineWidth = React.memo(({value, onChange}: DialogLineWidthProps) => {
    return (
        <Flex className={b()} direction="column" gap={2}>
            <Flex direction="row" alignItems="center" justifyContent="space-between">
                <Text variant="body-1">Толщина линии</Text>
                <LineWidthSelect value={value} onChange={onChange} />
            </Flex>
            <Flex direction="row" alignItems="center" justifyContent="flex-end">
                <NumberInput value={4} min={1} max={12} onChange={onChange} />
            </Flex>
        </Flex>
    );
});

DialogLineWidth.displayName = 'DialogLineWidth';
