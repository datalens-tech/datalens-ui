import React from 'react';

import block from 'bem-cn-lite';

import {MAX_YEAR, MIN_YEAR} from '../../constants';
import {Action, CalendarConfig} from '../../store';
import {FlipDirection, getSwitcherTitle, getUpdatedCalendarConfigByFlip} from '../../utils';

import {SwitcherButton} from './SwitcherButton';

const b = block('yc-simple-datepicker');

type SwitcherProps = {
    dispatch: React.Dispatch<Action>;
    calendar: CalendarConfig;
};

export const Switcher: React.FC<SwitcherProps> = (props) => {
    const {
        calendar: {month, year, mode},
        dispatch,
    } = props;
    const title = React.useMemo(() => getSwitcherTitle({month, year, mode}), [month, year, mode]);
    const mods = {
        years: mode === 'years',
        disabled: year <= MIN_YEAR || year >= MAX_YEAR,
    };

    const onTitleClick = React.useCallback(() => {
        dispatch({
            type: 'SET_CALENDAR',
            payload: {
                month,
                year,
                mode: mode === 'month' ? 'year' : 'years',
                animation: 'zoom-out',
            },
        });
    }, [dispatch, month, year, mode]);

    const updateCalendarConfig = React.useCallback(
        (updates: CalendarConfig, direction: FlipDirection) => {
            const nextCalendarConfig = getUpdatedCalendarConfigByFlip(
                {month: updates.month, year: updates.year, mode: updates.mode},
                direction,
            );

            dispatch({
                type: 'SET_CALENDAR',
                payload: nextCalendarConfig,
            });
        },
        [dispatch],
    );

    const flipBack = React.useCallback(
        () => updateCalendarConfig({month, year, mode}, FlipDirection.Back),
        [updateCalendarConfig, month, year, mode],
    );

    const flipForward = React.useCallback(
        () => updateCalendarConfig({month, year, mode}, FlipDirection.Forward),
        [updateCalendarConfig, month, year, mode],
    );

    return (
        <div className={b('switcher')}>
            <span
                className={b('switcher-title', mods)}
                onClick={mode === 'years' ? undefined : onTitleClick}
            >
                {title}
            </span>
            <div className={b('switcher-controls')}>
                <SwitcherButton
                    onClick={flipBack}
                    direction={FlipDirection.Back}
                    disabled={year <= MIN_YEAR}
                />
                <SwitcherButton
                    onClick={flipForward}
                    direction={FlipDirection.Forward}
                    disabled={year >= MAX_YEAR}
                />
            </div>
        </div>
    );
};
