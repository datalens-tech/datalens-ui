import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {Action, State} from '../../store';
import type {RangeDatepickerProps} from '../../types';
import {Pickers, Presets, ZonesList} from '../index';

import {Container} from './Container';

const i18n = I18n.keyset('components.common.RangeDatepicker');

const b = block('dl-range-datepicker');

interface ContentProps {
    dispatch: React.Dispatch<Action>;
    onUpdateAttempt: () => void;
    errors: State['errors'];
    from?: string;
    to?: string;
    min?: string;
    max?: string;
    dateFormat?: string;
    timeFormat?: RangeDatepickerProps['timeFormat'];
    timeZone?: string;
    popupClassName?: string;
    datePlaceholder?: string;
    active?: boolean;
    withTime?: boolean;
    withPresets?: boolean;
    withZonesList?: boolean;
    withApplyButton?: boolean;
    allowNullableValues?: boolean;
    hasClear?: boolean;
    controlRef?: React.RefObject<HTMLElement>;
}

export const Content: React.FC<ContentProps> = (props) => {
    const {
        errors,
        from,
        to,
        min,
        max,
        dateFormat,
        timeFormat,
        timeZone,
        popupClassName,
        datePlaceholder,
        active,
        withTime,
        withPresets,
        withZonesList,
        withApplyButton,
        allowNullableValues,
        hasClear,
        controlRef,
        dispatch,
        onUpdateAttempt,
    } = props;

    return (
        <Container
            controlRef={controlRef}
            popupClassName={popupClassName}
            active={active}
            withTime={withTime}
            dispatch={dispatch}
        >
            <Pickers
                errors={errors}
                from={from}
                to={to}
                min={min}
                max={max}
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                datePlaceholder={datePlaceholder}
                timeZone={timeZone}
                allowNullableValues={allowNullableValues}
                withTime={withTime}
                hasClear={hasClear}
                allowRelative={true}
                dispatch={dispatch}
            />
            {withApplyButton && (
                <div className={b('apply-button')}>
                    <Button size="s" view="normal" onClick={onUpdateAttempt} width="max">
                        {i18n('button_apply')}
                    </Button>
                </div>
            )}
            {withPresets && <Presets dispatch={dispatch} />}
            {withZonesList && <ZonesList timeZone={timeZone} dispatch={dispatch} />}
        </Container>
    );
};
