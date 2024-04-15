import React from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import {Icon, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {getTimeZoneOffset} from '../../utils';

const i18n = I18n.keyset('components.common.RangeDatepicker');

const b = block('dl-range-datepicker');
const DESKTOP_ICON_SIZE = 16;
const MOBILE_ICON_SIZE = 20;

interface SwitcherProps {
    timeZone?: string;
}

export const Switcher: React.FC<SwitcherProps> = ({timeZone}) => {
    const mobile = useMobile();

    return (
        <div className={b('zones-list-switcher', {mobile})}>
            <div className={b('zones-list-switcher-zone', {empty: !timeZone})} title={timeZone}>
                {timeZone || i18n('label_empty_zone')}
            </div>
            {timeZone && <div className={b('timezone-offset')}>{getTimeZoneOffset(timeZone)}</div>}
            <Icon
                className={b('zones-list-switcher-icon')}
                data={ChevronRight}
                size={mobile ? MOBILE_ICON_SIZE : DESKTOP_ICON_SIZE}
            />
        </div>
    );
};
