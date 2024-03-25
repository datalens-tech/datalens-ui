import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {Popover, PopoverInstanceProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {isStartsLikeRelative} from '../../../SimpleDatepicker/utils';
import {useRangeDatepickerPreset} from '../../RangeDatepickerProvider';
import {State} from '../../store';
import type {RangeDatepickerProps} from '../../types';

const i18n = I18n.keyset('components.common.RangeDatepicker');
const b = block('dl-range-datepicker');

export const getFormattedRangeItem = (opt: {
    dateFormat: string;
    input?: string;
    timeZone?: string;
    timeFormat?: RangeDatepickerProps['timeFormat'];
    withTime?: boolean;
    showAsAbsolute?: boolean;
    roundUp?: boolean;
}) => {
    const {input, dateFormat, timeZone, timeFormat, withTime, showAsAbsolute, roundUp} = opt;
    const format = withTime ? `${dateFormat} ${timeFormat}` : dateFormat;

    return isStartsLikeRelative(input) && !showAsAbsolute
        ? input
        : dateTimeParse(input, {timeZone, roundUp})?.format(format);
};

interface LabelProps {
    dateFormat: string;
    errors: State['errors'];
    from?: string;
    to?: string;
    rangeTitle?: string;
    timeZone?: string;
    timeFormat?: RangeDatepickerProps['timeFormat'];
    active?: boolean;
    showAsAbsolute?: boolean;
    withTime?: boolean;
}

export const Label: React.FC<LabelProps> = ({
    dateFormat,
    errors,
    from,
    to,
    rangeTitle,
    timeZone,
    timeFormat,
    active,
    showAsAbsolute,
    withTime,
}) => {
    const labelRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<PopoverInstanceProps>(null);
    const showTooltip = Boolean(!errors.length && !active && from && to);
    const {selectedPreset} = useRangeDatepickerPreset();
    const label = React.useMemo(() => {
        if (typeof rangeTitle === 'string') return rangeTitle;

        if (!showAsAbsolute && selectedPreset) {
            return selectedPreset.title;
        }

        let fromItem = '';
        let toItem = '';
        let dash = '';

        if (from) {
            fromItem = errors.includes('from')
                ? from
                : getFormattedRangeItem({
                      input: from,
                      dateFormat,
                      timeZone,
                      timeFormat,
                      withTime,
                      showAsAbsolute,
                  }) || '';
        }

        if (to) {
            toItem = errors.includes('to')
                ? to
                : getFormattedRangeItem({
                      input: to,
                      dateFormat,
                      timeZone,
                      timeFormat,
                      withTime,
                      showAsAbsolute,
                      roundUp: true,
                  }) || '';
        }

        if (fromItem || toItem) {
            dash = ' — ';
        }

        return `${fromItem}${dash}${toItem}`;
    }, [
        rangeTitle,
        dateFormat,
        timeZone,
        timeFormat,
        errors,
        from,
        to,
        withTime,
        showAsAbsolute,
        selectedPreset,
    ]);

    React.useEffect(() => {
        if (active) {
            tooltipRef.current?.closeTooltip();
        }
    }, [active]);

    const tooltipContent = React.useMemo(
        () => (
            <div className={b('control-label-tooltip')}>
                <span className={b('control-label-tooltip-item')}>
                    {dateTimeParse(from, {timeZone})?.format(`${dateFormat} HH:mm:ss`)}
                </span>
                <span className={b('control-label-tooltip-to')}>{i18n('label_to')}</span>
                <span className={b('control-label-tooltip-item')}>
                    {dateTimeParse(to, {timeZone, roundUp: isStartsLikeRelative(to)})?.format(
                        `${dateFormat} HH:mm:ss`,
                    )}
                </span>
                {timeZone && <span className={b('control-label-tooltip-tz')}>{timeZone}</span>}
            </div>
        ),
        [from, to, dateFormat, timeZone],
    );

    return (
        <div
            ref={labelRef}
            className={b('control-label', {
                preset: Boolean(selectedPreset || rangeTitle),
            })}
        >
            <Popover
                disabled={!showTooltip}
                content={tooltipContent}
                placement={['right']}
                hasArrow={false}
                delayOpening={500}
                className={b('popover')}
            >
                {label}
            </Popover>
        </div>
    );
};
