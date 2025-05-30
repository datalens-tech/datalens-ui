import React from 'react';

import type {SegmentedRadioGroupOptionProps} from '@gravity-ui/uikit';
import {i18n} from 'i18n';

import {SETTINGS} from '../../../../constants';

export const SCALE_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.SCALE.AUTO,
        content: i18n('wizard', 'label_auto'),
    },
    {
        value: SETTINGS.SCALE.MANUAL,
        content: i18n('wizard', 'label_manual'),
    },
];

export const SCALE_VALUE_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.SCALE_VALUE.MIN_MAX,
        content: (
            <React.Fragment>
                <span>{i18n('wizard', 'label_autoscale')} </span>
                {i18n('wizard', 'label_scale-min-max')}
            </React.Fragment>
        ),
    },
    {
        value: SETTINGS.SCALE_VALUE.ZERO_MAX,
        content: (
            <React.Fragment>
                <span>{i18n('wizard', 'label_autoscale')} </span>
                {i18n('wizard', 'label_scale-0-max')}
            </React.Fragment>
        ),
    },
];

export const AXIS_TITLE_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.TITLE.AUTO,
        content: i18n('wizard', 'label_on'),
    },
    {
        value: SETTINGS.TITLE.OFF,
        content: i18n('wizard', 'label_off'),
    },
    {
        value: SETTINGS.TITLE.MANUAL,
        content: i18n('wizard', 'label_manual'),
    },
];

export const AXIS_TYPE_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.TYPE.LINEAR,
        content: i18n('wizard', 'label_linear'),
    },
    {
        value: SETTINGS.TYPE.LOGARITHMIC,
        content: i18n('wizard', 'label_logarithmic'),
    },
];

export const AXIS_VISIBILITY_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.AXIS_VISIBILITY.SHOW,
        content: i18n('wizard', 'label_show'),
    },
    {
        value: SETTINGS.AXIS_VISIBILITY.HIDE,
        content: i18n('wizard', 'label_hide'),
    },
];

export const GRID_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.GRID.ON,
        content: i18n('wizard', 'label_on'),
    },
    {
        value: SETTINGS.GRID.OFF,
        content: i18n('wizard', 'label_off'),
    },
];

export const GRID_STEP_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.GRID_STEP.AUTO,
        content: i18n('wizard', 'label_auto'),
    },
    {
        value: SETTINGS.GRID_STEP.MANUAL,
        content: i18n('wizard', 'label_manual'),
    },
];

export const HIDE_LABELS_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.HIDE_LABELS.NO,
        content: i18n('wizard', 'label_on'),
    },
    {
        value: SETTINGS.HIDE_LABELS.YES,
        content: i18n('wizard', 'label_off'),
    },
];

export const LABELS_VIEW_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.LABELS_VIEW.AUTO,
        content: i18n('wizard', 'label_auto'),
    },
    {
        value: SETTINGS.LABELS_VIEW.HORIZONTAL,
        content: i18n('wizard', 'label_horizontal'),
    },
    {
        value: SETTINGS.LABELS_VIEW.VERTICAL,
        content: i18n('wizard', 'label_vertical'),
    },
    {
        value: SETTINGS.LABELS_VIEW.ANGLE,
        content: i18n('wizard', 'label_angle'),
    },
];

export const DEFAULT_NULLS_OPTIONS_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.NULLS.IGNORE,
        content: i18n('wizard', 'label_ignore'),
    },
    {
        value: SETTINGS.NULLS.AS_ZERO,
        content: i18n('wizard', 'label_as-0'),
    },
];

export const HOLIDAYS_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {value: SETTINGS.HOLIDAYS.ON, content: i18n('wizard', 'label_on')},
    {value: SETTINGS.HOLIDAYS.OFF, content: i18n('wizard', 'label_off')},
];

export const POLYLINE_POINTS_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {value: SETTINGS.POLYLINE_POINTS.ON, content: i18n('wizard', 'label_on')},
    {value: SETTINGS.POLYLINE_POINTS.OFF, content: i18n('wizard', 'label_off')},
];

export const AXIS_FORMAT_MODE_RADIO_BUTTON_OPTIONS: SegmentedRadioGroupOptionProps[] = [
    {value: SETTINGS.AXIS_FORMAT_MODE.AUTO, content: i18n('wizard', 'label_auto')},
    {
        value: SETTINGS.AXIS_FORMAT_MODE.BY_FIELD,
        content: '',
    },
];

export const AXIS_MODE_RADIO_BUTTONS: SegmentedRadioGroupOptionProps[] = [
    {
        value: SETTINGS.AXIS_MODE.DISCRETE,
        content: i18n('wizard', 'label_discrete'),
    },
    {
        value: SETTINGS.AXIS_MODE.CONTINUOUS,
        content: i18n('wizard', 'label_continuous'),
    },
];
