import React from 'react';

import {Flex, Icon, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import type {IconData} from '@gravity-ui/uikit';
import {LINE_CAPS, LINE_JOINS} from 'ui/units/wizard/constants/shapes';
import type {LineCap, LineJoin} from 'ui/units/wizard/typings/shapes';

import {LineCapRoundIcon} from './icons/LineCapRoundIcon';
import {LineCapSquareIcon} from './icons/LineCapSquareIcon';
import {LineJoinRoundIcon} from './icons/LineJoinRoundIcon';
import {LineJoinSquareIcon} from './icons/LineJoinSquareIcon';

export type DialogLineCapAndJoinValue = {
    cap: LineCap;
    join: LineJoin;
};

type Props = {
    value: DialogLineCapAndJoinValue;
    onChange: (value: DialogLineCapAndJoinValue) => void;
};

const CAP_ICONS: Record<LineCap, IconData> = {
    [LINE_CAPS.ROUND]: LineCapRoundIcon,
    [LINE_CAPS.SQUARE]: LineCapSquareIcon,
};

const JOIN_ICONS: Record<LineJoin, IconData> = {
    [LINE_JOINS.MITER]: LineJoinSquareIcon,
    [LINE_JOINS.ROUND]: LineJoinRoundIcon,
};

const CAP_VALUES: LineCap[] = [LINE_CAPS.SQUARE, LINE_CAPS.ROUND];
const JOIN_VALUES: LineJoin[] = [LINE_JOINS.MITER, LINE_JOINS.ROUND];

const OPTIONS_GROUP_STYLE = {
    width: '136px',
};

// TODO: Fix in a separate branch
const I18N_STUB = {
    'dialog-line-cap-title': 'Концы линий',
    'dialog-line-join-title': 'Соединения линий',
};

type OptionRowProps<T extends string> = {
    label: string;
    value: T;
    icons: Record<T, IconData>;
    values: T[];
    onUpdate: (value: T) => void;
};

const OptionRow = <T extends string>({
    label,
    value,
    icons,
    values,
    onUpdate,
}: OptionRowProps<T>) => (
    <Flex direction="row" alignItems="center" justifyContent="space-between">
        <Text variant="body-1">{label}</Text>
        <SegmentedRadioGroup
            value={value}
            style={OPTIONS_GROUP_STYLE}
            onUpdate={onUpdate as (value: string) => void}
        >
            {values.map((optionValue) => (
                <SegmentedRadioGroup.Option key={optionValue} value={optionValue}>
                    <Icon data={icons[optionValue]} />
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    </Flex>
);

export const DialogLineCapAndJoin = React.memo(({onChange, value}: Props) => {
    const [join, setJoin] = React.useState<LineJoin>(value.join);
    const [cap, setCap] = React.useState<LineCap>(value.cap);

    React.useEffect(() => {
        onChange({cap, join});
    }, [cap, join, onChange]);

    return (
        <Flex gap={2} direction="column">
            <OptionRow
                label={I18N_STUB['dialog-line-join-title']}
                value={join}
                icons={JOIN_ICONS}
                values={JOIN_VALUES}
                onUpdate={setJoin}
            />
            <OptionRow
                label={I18N_STUB['dialog-line-cap-title']}
                value={cap}
                icons={CAP_ICONS}
                values={CAP_VALUES}
                onUpdate={setCap}
            />
        </Flex>
    );
});

DialogLineCapAndJoin.displayName = 'DialogLineCapAndJoin';
