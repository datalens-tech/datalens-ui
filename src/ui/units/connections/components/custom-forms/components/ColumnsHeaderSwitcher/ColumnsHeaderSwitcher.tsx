import React from 'react';

import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './ColumnsHeaderSwitcher.scss';

const b = block('conn-columns-header-switcher');
const i18n = I18n.keyset('connections.gsheet.view');
const HEADER = {
    OFF: 'off',
    ON: 'on',
};

type ColumnsHeaderSwitcherProps = {
    value: boolean;
    onUpdate: (value: boolean) => void;
};

const convertBoolHeaderToString = (value?: boolean) => {
    return value ? HEADER.ON : HEADER.OFF;
};

const convertStringHeaderToBool = (value?: string) => {
    return value === HEADER.ON;
};

export const ColumnsHeaderSwitcher = (props: ColumnsHeaderSwitcherProps) => {
    const {value, onUpdate} = props;
    const header = convertBoolHeaderToString(value);
    const [selectedHeader, setSelectedHeader] = React.useState(header);

    const handleHeaderUpdate = React.useCallback(
        (nextValue: string) => {
            setSelectedHeader(nextValue);
            onUpdate(convertStringHeaderToBool(nextValue));
        },
        [onUpdate],
    );

    React.useEffect(() => {
        const nextHeader = convertBoolHeaderToString(value);
        setSelectedHeader(nextHeader);
    }, [value]);

    return (
        <div className={b()}>
            <span className={b('label')}>{i18n('label_columns-header')}</span>
            <RadioButton value={selectedHeader} onUpdate={handleHeaderUpdate}>
                <RadioButton.Option content={i18n('label_yes')} value={HEADER.ON} />
                <RadioButton.Option content={i18n('label_no')} value={HEADER.OFF} />
            </RadioButton>
        </div>
    );
};
