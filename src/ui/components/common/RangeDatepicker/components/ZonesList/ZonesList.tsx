import React from 'react';

import {getTimeZonesList} from '@gravity-ui/date-utils';
import {useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {UTC_TIMEZONE} from '../../../SimpleDatepicker/constants';
import {YCSelect} from '../../../YCSelect';
import {Action} from '../../store';
import {getTimeZoneOffset} from '../../utils';

import {Switcher} from './Switcher';

const b = block('yc-range-datepicker');
const WITH_BRACKETS = false;

const getZonesItems = () => {
    return getTimeZonesList().map((zone) => ({
        title: (
            <div className={b('timezone-item')}>
                <div className={b('timezone-item-title')} title={zone}>
                    {zone}&nbsp;
                </div>
                <div className={b('timezone-offset')}>{getTimeZoneOffset(zone, WITH_BRACKETS)}</div>
            </div>
        ),
        value: zone,
    }));
};

interface ZonesListProps {
    dispatch: React.Dispatch<Action>;
    timeZone?: string;
}

export const ZonesList: React.FC<ZonesListProps> = ({timeZone, dispatch}) => {
    const [mobile] = useMobile();
    const zones = React.useMemo(() => getZonesItems(), []);

    const selectZone = (nextZone: string) => {
        dispatch({type: 'SET_TIMEZONE', payload: {selectedTimeZone: nextZone}});
    };

    const renderSwitcher = React.useCallback(() => <Switcher timeZone={timeZone} />, [timeZone]);

    return (
        <div className={b('zones-list', {mobile})}>
            <YCSelect
                virtualizeThreshold={50}
                items={zones}
                value={timeZone}
                allowEmptyValue={timeZone !== UTC_TIMEZONE}
                onUpdate={selectZone}
                renderSwitcher={renderSwitcher}
            />
        </div>
    );
};
