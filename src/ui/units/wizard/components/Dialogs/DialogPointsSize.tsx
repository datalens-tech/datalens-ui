import React from 'react';

import {GeoDots} from '@gravity-ui/icons';
import {Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import type {PointSizeConfig} from 'shared';
import {registry} from 'ui/registry';

import './DialogPointsSize.scss';

const {RangeInputPicker} = registry.common.components.getAll();

export const DIALOG_POINTS_SIZE = Symbol('DIALOG_POINTS_SIZE');

const b = block('dialog-points-size');
const DEFAULT_RADIUS_PERCENT = 8;
const DEFAULT_MIN_RADIUS_PERCENT = 2;
const DEFAULT_MAX_RADIUS_PERCENT = 8;
const RANGE_INPUT_STEP = 1;
const RANGE_INPUT_MIN = 1;
const RANGE_INPUT_MAX = 40;
const PERCENT_RANGE = {min: 1, max: 20};
const RADIUS_RANGE = {min: 0.5, max: 10};

type RangeMinMax = {
    min: number;
    max: number;
};

type ConvertToRangeArgs = {
    from: RangeMinMax;
    to: RangeMinMax;
    value: number;
    needRounding?: boolean;
};

const convertToRange = ({from, to, value, needRounding}: ConvertToRangeArgs) => {
    const result = to.min + (value - from.min) * ((to.max - to.min) / (from.max - from.min));

    return needRounding ? Math.round(result) : result;
};

const convertConfigToState = ({radius, minRadius, maxRadius}: PointSizeConfig): State => {
    const radiusPercent = radius
        ? convertToRange({
              value: radius,
              needRounding: true,
              from: RADIUS_RANGE,
              to: PERCENT_RANGE,
          })
        : DEFAULT_RADIUS_PERCENT;
    const minRadiusPercent = radius
        ? convertToRange({
              value: minRadius,
              needRounding: true,
              from: RADIUS_RANGE,
              to: PERCENT_RANGE,
          })
        : DEFAULT_MIN_RADIUS_PERCENT;
    const maxRadiusPercent = radius
        ? convertToRange({
              value: maxRadius,
              needRounding: true,
              from: RADIUS_RANGE,
              to: PERCENT_RANGE,
          })
        : DEFAULT_MAX_RADIUS_PERCENT;

    return {
        radiusPercent,
        minRadiusPercent,
        maxRadiusPercent,
    };
};

interface Props {
    geopointsConfig: PointSizeConfig;
    hasMeasure: boolean;
    onApply: (pointsSizesConfig: PointSizeConfig) => void;
    onCancel: () => void;
    pointType: 'geopoint' | 'scatter';
}

interface State {
    radiusPercent: number;
    minRadiusPercent: number;
    maxRadiusPercent: number;
}

export type OpenDialogPointsSizeArgs = {
    id: typeof DIALOG_POINTS_SIZE;
    props: Props;
};

class DialogPointsSize extends React.PureComponent<Props, State> {
    state = convertConfigToState(this.props.geopointsConfig);

    render() {
        const {hasMeasure, onCancel, pointType} = this.props;
        const {radiusPercent, minRadiusPercent, maxRadiusPercent} = this.state;

        return (
            <Dialog open={true} onClose={onCancel}>
                <div className={b()}>
                    <Dialog.Header
                        insertBefore={
                            <div className={b('title-icon')}>
                                <Icon data={GeoDots} size={18} />
                            </div>
                        }
                        caption={i18n('wizard', `section_${pointType}`)}
                    />
                    <Dialog.Body>
                        {hasMeasure ? (
                            <React.Fragment>
                                <div className={b('row')}>
                                    <div className={b('row-label')}>
                                        {i18n('wizard', `label_dialog-radius-min`)}
                                    </div>
                                    <div className={b('range-input')}>
                                        <RangeInputPicker
                                            size="s"
                                            value={minRadiusPercent || RANGE_INPUT_MIN}
                                            minValue={RANGE_INPUT_MIN}
                                            maxValue={RANGE_INPUT_MAX}
                                            step={RANGE_INPUT_STEP}
                                            onUpdate={this.onMinRadiusPercentChange}
                                        />
                                    </div>
                                </div>
                                <div className={b('row')}>
                                    <div className={b('row-label')}>
                                        {i18n('wizard', `label_dialog-radius-max`)}
                                    </div>
                                    <div className={b('range-input')}>
                                        <RangeInputPicker
                                            size="s"
                                            value={maxRadiusPercent || RANGE_INPUT_MIN}
                                            minValue={RANGE_INPUT_MIN}
                                            maxValue={RANGE_INPUT_MAX}
                                            step={RANGE_INPUT_STEP}
                                            onUpdate={this.onMaxRadiusPercentChange}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        ) : (
                            <div className={b('row')}>
                                <div className={b('row-label')}>
                                    {i18n('wizard', `label_dialog-radius`)}
                                </div>
                                <div className={b('range-input')}>
                                    <RangeInputPicker
                                        size="s"
                                        value={radiusPercent || RANGE_INPUT_MIN}
                                        minValue={RANGE_INPUT_MIN}
                                        maxValue={RANGE_INPUT_MAX}
                                        step={RANGE_INPUT_STEP}
                                        onUpdate={this.onRadiusPercentChange}
                                    />
                                </div>
                            </div>
                        )}
                    </Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={this.props.onCancel}
                        onClickButtonApply={this.onApplyButtonClick}
                        textButtonApply={i18n('wizard', 'button_apply')}
                        textButtonCancel={i18n('wizard', 'button_cancel')}
                    />
                </div>
            </Dialog>
        );
    }

    private getPointsSizeConfig = () => {
        const {radiusPercent, minRadiusPercent, maxRadiusPercent} = this.state;

        return {
            radius: convertToRange({
                value: radiusPercent,
                from: PERCENT_RANGE,
                to: RADIUS_RANGE,
            }),
            minRadius: convertToRange({
                value: minRadiusPercent,
                from: PERCENT_RANGE,
                to: RADIUS_RANGE,
            }),
            maxRadius: convertToRange({
                value: maxRadiusPercent,
                from: PERCENT_RANGE,
                to: RADIUS_RANGE,
            }),
        };
    };

    private onRadiusPercentChange = (radiusPercent: number) => {
        this.setState({
            radiusPercent,
        });
    };

    private onMinRadiusPercentChange = (minRadiusPercent: number) => {
        this.setState({
            minRadiusPercent,
        });
    };

    private onMaxRadiusPercentChange = (maxRadiusPercent: number) => {
        this.setState({
            maxRadiusPercent,
        });
    };

    private onApplyButtonClick = () => {
        this.props.onApply(this.getPointsSizeConfig());
    };
}

DialogManager.registerDialog(DIALOG_POINTS_SIZE, DialogPointsSize);
