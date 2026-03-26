import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Icon, SegmentedRadioGroup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Feature, LINE_CAP, LINE_JOIN} from 'shared';
import type {LineCap, LineJoin, LineShapeSettings} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {i18n} from '../../i18n';
import {LineWidthControl} from '../LineWidth/LineWidth';

import LineCapButt from '../../../../../../../assets/icons/line-cap-butt.svg';
import LineCapRound from '../../../../../../../assets/icons/line-cap-round.svg';
import LineJoinMitter from '../../../../../../../assets/icons/line-join-miter.svg';
import LineJoinRound from '../../../../../../../assets/icons/line-join-round.svg';

import './CommonSettings.scss';

const b = block('dialog-line-shapes');

export const CommonSettings = ({
    value,
    onChange,
}: {
    value: LineShapeSettings | undefined;
    onChange: (value: LineShapeSettings) => void;
}) => {
    const handleChangeLineWidth = React.useCallback(
        (val: number | 'auto' | undefined) => {
            onChange({...value, lineWidth: val});
        },
        [onChange, value],
    );

    const handleChangeLineJoin = React.useCallback(
        (val: LineJoin) => onChange({...value, linejoin: val}),
        [onChange, value],
    );

    const handleChangeLineCap = React.useCallback(
        (val: LineCap) => onChange({...value, linecap: val}),
        [onChange, value],
    );

    return (
        <div className={b('common-settings')}>
            <FormRow label={i18n('label_line-width')} className={b('form-row')}>
                <LineWidthControl value={value?.lineWidth} onChange={handleChangeLineWidth} />
            </FormRow>
            {isEnabledFeature(Feature.GravityChartsForLineAreaAndBarX) && (
                <React.Fragment>
                    <FormRow label={i18n('label_linejoin')} className={b('form-row')}>
                        <SegmentedRadioGroup
                            value={value?.linejoin ?? LINE_JOIN.Miter}
                            width="max"
                            onUpdate={handleChangeLineJoin}
                        >
                            <SegmentedRadioGroup.Option
                                value={LINE_JOIN.Miter}
                                content={
                                    <Icon className={b('line-join-icon')} data={LineJoinMitter} />
                                }
                            />
                            <SegmentedRadioGroup.Option
                                value={LINE_JOIN.Round}
                                content={
                                    <Icon className={b('line-join-icon')} data={LineJoinRound} />
                                }
                            />
                        </SegmentedRadioGroup>
                    </FormRow>
                    <FormRow label={i18n('label_linecap')} className={b('form-row')}>
                        <SegmentedRadioGroup
                            width="max"
                            value={value?.linecap ?? LINE_CAP.Butt}
                            onUpdate={handleChangeLineCap}
                        >
                            <SegmentedRadioGroup.Option
                                value={LINE_CAP.Butt}
                                content={<Icon className={b('line-cap-icon')} data={LineCapButt} />}
                            />
                            <SegmentedRadioGroup.Option
                                value={LINE_CAP.Round}
                                content={
                                    <Icon className={b('line-cap-icon')} data={LineCapRound} />
                                }
                            />
                        </SegmentedRadioGroup>
                    </FormRow>
                </React.Fragment>
            )}
        </div>
    );
};
