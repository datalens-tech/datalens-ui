import React from 'react';

import {Flex, Text} from '@gravity-ui/uikit';
import NumberInput from 'ui/components/NumberFormatSettings/NumberInput/NumberInput';
import {LINE_WIDTH_MAX_VALUE, LINE_WIDTH_MIN_VALUE} from 'ui/units/wizard/constants/shapes';

import {LineWidthSelect} from '../../../LineWidthSelect/LineWidthSelect';

interface DialogLineWidthProps {
    value: number;
    onChange: (lineWidth: number) => void;
}

// TODO: Fix in a separate branch
const I18N_STUB = {
    'dialog-line-width-title': 'Толщина линии',
};

export const DialogLineWidth = React.memo(({value, onChange}: DialogLineWidthProps) => {
    return (
        <Flex direction="column" gap={2}>
            <Flex direction="row" alignItems="center" justifyContent="space-between">
                <Text variant="body-1">{I18N_STUB['dialog-line-width-title']}</Text>
                <LineWidthSelect value={value} onChange={onChange} />
            </Flex>
            <Flex direction="row" alignItems="center" justifyContent="flex-end">
                <NumberInput
                    value={value}
                    min={LINE_WIDTH_MIN_VALUE}
                    max={LINE_WIDTH_MAX_VALUE}
                    onChange={onChange}
                />
            </Flex>
        </Flex>
    );
});

DialogLineWidth.displayName = 'DialogLineWidth';
