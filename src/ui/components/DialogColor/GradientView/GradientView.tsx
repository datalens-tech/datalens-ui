import React, {ChangeEvent} from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {ArrowRightArrowLeft} from '@gravity-ui/icons';
import {Button, Checkbox, Icon, RadioButton, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useSelector} from 'react-redux';
import {ColorsConfig, DialogColorQa, GradientType} from 'shared';
import {DatalensGlobalState, selectAvailableClientGradients, selectDefaultClientGradient} from 'ui';

import {FieldWrapper} from '../../FieldWrapper/FieldWrapper';
import {GradientPalettePreview} from '../../GradientPalettePreview/GradientPalettePreview';
import {SelectOptionWithIcon} from '../../SelectComponents';
import {ValidationStatus} from '../types';

import {getGradientSelectorItems} from './utils';

import './GradientView.scss';

const b = block('dialog-color');
const SHOW = 'show';
const HIDE = 'hide';
export const AUTO = 'auto';
const MANUAL = 'manual';
const TOOLTIP_DELAY_CLOSING = 250;

interface Props {
    colorConfig: ColorsConfig;
    onChange: (args: Partial<ColorsConfig>) => void;
    usePolygonBorders: boolean;
    validationStatus: ValidationStatus;
}

export const GradientView = (props: Props) => {
    const {colorConfig, usePolygonBorders, validationStatus, onChange} = props;

    const gradientMode = colorConfig.gradientMode || GradientType.TWO_POINT;
    const gradientPalette =
        colorConfig.gradientPalette || selectDefaultClientGradient(gradientMode);
    const gradients = useSelector((state: DatalensGlobalState) =>
        selectAvailableClientGradients(state, gradientMode),
    );

    const currentPalette = gradients[gradientPalette];
    const options = getGradientSelectorItems(gradients);

    const colors = [...currentPalette.colors];
    if (colorConfig.reversed) {
        colors.reverse();
    }

    const handleGradientTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const gradientType = event.target.value as GradientType;
        onChange({
            gradientMode: gradientType,
            gradientPalette: selectDefaultClientGradient(gradientType),
        });
    };

    return (
        <React.Fragment>
            <div className={b('row')}>
                <span className={b('label')}>{i18n('wizard', 'label_gradient-type')}</span>
                <RadioButton
                    size="m"
                    value={gradientMode}
                    onChange={handleGradientTypeChange}
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
            {usePolygonBorders && (
                <div className={b('row')}>
                    <span className={b('label')}>{i18n('wizard', 'label_borders')}</span>
                    <RadioButton
                        size="m"
                        value={colorConfig.polygonBorders}
                        onChange={(event) =>
                            onChange({
                                polygonBorders: event.target.value,
                            })
                        }
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
                        onUpdate={([value]: string[]) => {
                            onChange({
                                gradientPalette: value,
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
                    onClick={() => onChange({reversed: !colorConfig.reversed})}
                >
                    <Icon data={ArrowRightArrowLeft} width={24} />
                </Button>
            </div>
            <div className={b('row')}>
                <Checkbox
                    className={b('thresholds-checkbox')}
                    size="m"
                    onChange={() =>
                        onChange({
                            thresholdsMode: colorConfig.thresholdsMode === AUTO ? MANUAL : AUTO,
                        })
                    }
                    checked={colorConfig.thresholdsMode === MANUAL}
                >
                    <span>
                        {i18n('wizard', 'label_thresholds')}
                        <HelpPopover
                            delayClosing={TOOLTIP_DELAY_CLOSING}
                            placement={['bottom']}
                            className={b('hint-icon')}
                            content={<span>{i18n('wizard', 'label_tooltip-thresholds')}</span>}
                        />
                    </span>
                </Checkbox>
                {colorConfig.thresholdsMode === MANUAL && (
                    <div className={b('threshold-inputs-wrapper')}>
                        <div className={b('threshold-input')}>
                            <FieldWrapper error={validationStatus.leftThreshold}>
                                <TextInput
                                    type="number"
                                    pin="round-round"
                                    size="m"
                                    value={colorConfig.leftThreshold}
                                    onUpdate={(value) => {
                                        onChange({
                                            leftThreshold: value,
                                        });
                                    }}
                                />
                            </FieldWrapper>
                        </div>
                        {gradientMode === GradientType.THREE_POINT && (
                            <div className={b('threshold-input')}>
                                <FieldWrapper error={validationStatus.middleThreshold}>
                                    <TextInput
                                        type="number"
                                        size="m"
                                        pin="round-round"
                                        value={colorConfig.middleThreshold}
                                        onUpdate={(value) => {
                                            onChange({
                                                middleThreshold: value,
                                            });
                                        }}
                                    />
                                </FieldWrapper>
                            </div>
                        )}
                        <div className={b('threshold-input')}>
                            <FieldWrapper error={validationStatus.rightThreshold}>
                                <TextInput
                                    type="number"
                                    pin="round-round"
                                    size="m"
                                    value={colorConfig.rightThreshold}
                                    onUpdate={(value) =>
                                        onChange({
                                            rightThreshold: value,
                                        })
                                    }
                                />
                            </FieldWrapper>
                        </div>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};
