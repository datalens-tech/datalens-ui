import React from 'react';

import {SegmentedRadioGroup as RadioButton, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {
    AUTO_PALETTE_ID,
    COMMON_PALETTE_ID,
    type ColorPalette,
    type DatasetOptions,
    type Field,
    type FilterField,
    type Update,
} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents';

import {PaletteTypes} from '../../../../constants';
import {getPaletteSelectorItems} from '../../../../utils/palette';
import Palette from '../../../Palette/Palette';
import ValuesList from '../../../ValuesList/ValuesList';
import type {ExtraSettings} from '../DialogColor';

import './DialogColorPalette.scss';

const b = block('dialog-color-palette');

export const DEFAULT_COLOR = 'auto';
export const SHOW = 'show';
const HIDE = 'hide';

export interface PaletteState {
    mountedColors: Record<string, string>;
    palette: string;
    selectedValue: string | null;
    polygonBorders: string;
}

export interface Props {
    item: Field;
    items?: Field[];
    distincts?: Record<string, string[]>;
    filters: FilterField[];
    parameters: Field[];
    dashboardParameters: Field[];
    updates: Update[];
    options: DatasetOptions;
    datasetId: string;
    paletteState: PaletteState;
    onPaletteItemClick: (color: string, index: number) => void;
    setPaletteState: (newPaletteState: Partial<PaletteState>) => void;
    extra: ExtraSettings;
    colorPalettes: ColorPalette[];
    colorsList: string[];
    colorSectionFields?: Field[];
}

class PaletteContainer extends React.Component<Props> {
    render() {
        return (
            <div className={b('container')}>
                <ValuesList
                    sectionFields={this.props.colorSectionFields}
                    item={this.props.item}
                    items={this.props.items}
                    distincts={this.props.distincts}
                    filters={this.props.filters}
                    updates={this.props.updates}
                    options={this.props.options}
                    parameters={this.props.parameters}
                    dashboardParameters={this.props.dashboardParameters}
                    datasetId={this.props.datasetId}
                    selectedValue={this.props.paletteState.selectedValue}
                    renderValueIcon={this.renderValueIcon}
                    onChangeSelectedValue={(selectedValue, shouldClearPalette) => {
                        this.props.setPaletteState({selectedValue});
                        if (shouldClearPalette) {
                            this.props.setPaletteState({mountedColors: {}});
                        }
                    }}
                    extra={this.props.extra}
                />
                {this.renderPaletteContainer()}
            </div>
        );
    }

    renderValueIcon = (value: string) => {
        const {mountedColors} = this.props.paletteState;
        const {colorsList} = this.props;

        const mountedColor = mountedColors[value];
        return (
            <div
                className={b('value-color', {default: !mountedColor})}
                style={{
                    backgroundColor: colorsList[Number(mountedColor)] || mountedColor,
                }}
            >
                {mountedColor ? null : 'a'}
            </div>
        );
    };

    renderPaletteContainer = () => {
        const {mountedColors, selectedValue, polygonBorders, palette} = this.props.paletteState;
        const {extra, colorPalettes, colorsList} = this.props;

        const options = getPaletteSelectorItems({
            colorPalettes,
        });

        // TODO: Support auto value
        const value = palette === AUTO_PALETTE_ID ? COMMON_PALETTE_ID.DEFAULT_20 : palette;

        return (
            <div className={b('palette-container')}>
                <Select
                    qa="palette-select"
                    value={[value]}
                    options={options}
                    className={b('palette-select')}
                    onUpdate={([selectedPalette]) => {
                        this.props.setPaletteState({
                            palette: selectedPalette,
                            mountedColors: {},
                        });
                    }}
                    popupClassName={b('palette-select-popup')}
                    renderSelectedOption={(option) => {
                        return <SelectOptionWithIcon option={option} />;
                    }}
                    renderOption={(option) => {
                        return <SelectOptionWithIcon option={option} />;
                    }}
                />
                <Palette
                    key={palette}
                    paletteType={PaletteTypes.Colors}
                    className={b('palette')}
                    onPaletteItemClick={this.props.onPaletteItemClick}
                    isSelectedItem={(color, index) => {
                        const colorValue = mountedColors[selectedValue!] || DEFAULT_COLOR;

                        if (colorValue === String(index)) {
                            return true;
                        }

                        return color === colorValue;
                    }}
                    isDefaultItem={(color) => color === DEFAULT_COLOR}
                    palette={colorsList}
                />
                {extra.polygonBorders && (
                    <div className={b('row')}>
                        <span className={b('label')}>{i18n('wizard', 'label_borders')}</span>
                        <RadioButton
                            size="m"
                            value={polygonBorders}
                            onChange={(event) => {
                                this.props.setPaletteState({
                                    polygonBorders: event.target.value,
                                });
                            }}
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
            </div>
        );
    };
}

export default PaletteContainer;
