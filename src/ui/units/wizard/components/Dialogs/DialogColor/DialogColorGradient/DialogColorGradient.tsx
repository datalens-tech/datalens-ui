import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {ArrowRightArrowLeft} from '@gravity-ui/icons';
import {Button, Checkbox, Icon, RadioButton, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import type {DatalensGlobalState} from 'index';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field, GradientPalettes} from 'shared';
import {DialogColorQa, GradientType, isMeasureValue} from 'shared';
import {selectAvailableClientGradients, selectDefaultClientGradient} from 'ui';
import type {GradientState} from 'units/wizard/actions/dialogColor';
import {setDialogColorGradientState} from 'units/wizard/actions/dialogColor';
import {GradientPalettePreview} from 'units/wizard/components/GradientPalettePreview/GradientPalettePreview';

import {SelectOptionWithIcon} from '../../../../../../components/SelectComponents';
import {getGradientSelectorItems} from '../../../../utils/palette';
import {validateThresholds} from '../../../../utils/wizard';

import './DialogColorGradient.scss';

const b = block('dialog-color-gradient');
const SHOW = 'show';
const HIDE = 'hide';
export const AUTO = 'auto';
const MANUAL = 'manual';
const TOOLTIP_DELAY_CLOSING = 250;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends StateProps, DispatchProps {
    gradientState: GradientState;
    extra?: {
        polygonBorders?: boolean;
    };
    setGradientState: (newGradientState: Partial<GradientState>) => void;
    item: Field;
}

class DialogColorGradientBody extends React.Component<Props> {
    _validateManualThresholds = ({
        leftThreshold = this.props.gradientState.leftThreshold,
        middleThreshold = this.props.gradientState.middleThreshold,
        rightThreshold = this.props.gradientState.rightThreshold,
    }) => {
        const {gradientMode} = this.props.gradientState;

        return validateThresholds({
            leftThreshold,
            rightThreshold,
            middleThreshold,
            pointsToValidate: gradientMode,
        });
    };

    getCurrentGradientPalette(gradients: GradientPalettes) {
        const {gradientPalette} = this.props.gradientState;
        return gradients[gradientPalette];
    }

    render() {
        const {
            gradientMode,
            gradientPalette,
            polygonBorders,
            reversed,
            thresholdsMode,
            leftThreshold,
            middleThreshold,
            rightThreshold,
            validationStatus,
        } = this.props.gradientState;
        const {extra = {}, item, gradients} = this.props;

        const currentPalette = this.getCurrentGradientPalette(gradients);
        const options = getGradientSelectorItems(gradients);

        if (!currentPalette) {
            return null;
        }

        const colors = [...currentPalette.colors];

        if (reversed) {
            colors.reverse();
        }

        return (
            <React.Fragment>
                <div className={b('row')}>
                    <span className={b('label')}>{i18n('wizard', 'label_gradient-type')}</span>
                    <RadioButton
                        size="m"
                        value={gradientMode}
                        onChange={(event) => {
                            const gradientType = event.target.value as GradientType;
                            this.props.setGradientState({
                                gradientMode: gradientType,
                                gradientPalette: selectDefaultClientGradient(gradientType),
                            });
                        }}
                        qa={DialogColorQa.GradientType}
                    >
                        <RadioButton.Option value={GradientType.TWO_POINT}>
                            {i18n('wizard', 'label_2-point')}
                        </RadioButton.Option>
                        <RadioButton.Option value={GradientType.THREE_POINT}>
                            {i18n('wizard', 'label_3-point')}
                        </RadioButton.Option>
                    </RadioButton>
                </div>
                {extra.polygonBorders && (
                    <div className={b('row')}>
                        <span className={b('label')}>{i18n('wizard', 'label_borders')}</span>
                        <RadioButton
                            size="m"
                            value={polygonBorders}
                            onChange={(event) => {
                                this.props.setGradientState({
                                    polygonBorders: event.target.value,
                                });
                            }}
                            qa="radio-buttons-polygon-borders"
                        >
                            <RadioButton.Option value={SHOW}>
                                {i18n('wizard', 'label_show')}
                            </RadioButton.Option>
                            <RadioButton.Option value={HIDE}>
                                {i18n('wizard', 'label_hide')}
                            </RadioButton.Option>
                        </RadioButton>
                    </div>
                )}
                <div className={b('row')}>
                    <div className={b('palette-select')}>
                        <Select
                            value={[gradientPalette]}
                            onUpdate={([gradientValue]) => {
                                this.props.setGradientState({
                                    gradientPalette: gradientValue,
                                });
                            }}
                            className={b('select')}
                            popupClassName={b('select-popup')}
                            options={options}
                            renderOption={(option) => {
                                return <SelectOptionWithIcon option={option} />;
                            }}
                            renderSelectedOption={(option) => {
                                return <SelectOptionWithIcon option={option} />;
                            }}
                        />
                    </div>
                    <GradientPalettePreview className={b('preview')} colors={colors} />
                    <Button
                        className={b('reverse-button')}
                        view="flat"
                        size="l"
                        onClick={() => {
                            this.props.setGradientState({
                                reversed: !reversed,
                            });
                        }}
                    >
                        <Icon data={ArrowRightArrowLeft} width={24} />
                    </Button>
                </div>
                {!isMeasureValue(item) && (
                    <div className={b('row')}>
                        <Checkbox
                            className={b('thresholds-checkbox')}
                            size="m"
                            onChange={() => {
                                this.props.setGradientState({
                                    thresholdsMode: thresholdsMode === AUTO ? MANUAL : AUTO,
                                });
                            }}
                            checked={thresholdsMode === MANUAL}
                        >
                            <span>
                                {i18n('wizard', 'label_thresholds')}
                                <HelpPopover
                                    delayClosing={TOOLTIP_DELAY_CLOSING}
                                    placement={['bottom']}
                                    className={b('hint-icon')}
                                    content={
                                        <span>{i18n('wizard', 'label_tooltip-thresholds')}</span>
                                    }
                                />
                            </span>
                        </Checkbox>
                        {thresholdsMode === MANUAL && (
                            <div className={b('threshold-inputs-wrapper')}>
                                <div className={b('threshold-input')}>
                                    <FieldWrapper
                                        error={
                                            validationStatus &&
                                            validationStatus.left &&
                                            validationStatus.left.text
                                        }
                                    >
                                        <TextInput
                                            type="number"
                                            pin="round-round"
                                            size="m"
                                            value={leftThreshold}
                                            onUpdate={(value) => {
                                                this.props.setGradientState({
                                                    leftThreshold: value,
                                                    validationStatus:
                                                        this._validateManualThresholds({
                                                            leftThreshold: value,
                                                        }),
                                                });
                                            }}
                                        />
                                    </FieldWrapper>
                                </div>
                                {gradientMode === GradientType.THREE_POINT && (
                                    <div className={b('threshold-input')}>
                                        <FieldWrapper
                                            error={
                                                validationStatus &&
                                                validationStatus.middle &&
                                                validationStatus.middle.text
                                            }
                                        >
                                            <TextInput
                                                type="number"
                                                size="m"
                                                pin="round-round"
                                                value={middleThreshold}
                                                onUpdate={(value) => {
                                                    this.props.setGradientState({
                                                        middleThreshold: value,
                                                        validationStatus:
                                                            this._validateManualThresholds({
                                                                middleThreshold: value,
                                                            }),
                                                    });
                                                }}
                                            />
                                        </FieldWrapper>
                                    </div>
                                )}
                                <div className={b('threshold-input')}>
                                    <FieldWrapper
                                        error={
                                            validationStatus &&
                                            validationStatus.right &&
                                            validationStatus.right.text
                                        }
                                    >
                                        <TextInput
                                            type="number"
                                            pin="round-round"
                                            size="m"
                                            value={rightThreshold}
                                            onUpdate={(value) => {
                                                this.props.setGradientState({
                                                    rightThreshold: value,
                                                    validationStatus:
                                                        this._validateManualThresholds({
                                                            rightThreshold: value,
                                                        }),
                                                });
                                            }}
                                        />
                                    </FieldWrapper>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        gradients: selectAvailableClientGradients(
            state,
            state.wizard.dialogColor.gradientState.gradientMode,
        ),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                setDialogColorGradientState,
            },
            dispatch,
        ),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DialogColorGradientBody);
