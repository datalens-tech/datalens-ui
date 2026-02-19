import React from 'react';

import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {
    type ColorPalette,
    type DatasetOptions,
    type Field,
    type FilterField,
    type Update,
} from 'shared';
import {ColorPaletteSelect} from 'ui/components/ColorPaletteSelect/ColorPaletteSelect';
import {ColorValueItem} from 'ui/components/ColorValueItem/ColorValueItem';

import ValuesList from '../../../ValuesList/ValuesList';
import type {ExtraSettings} from '../DialogColor';
import {
    PaletteWithCustomColor,
    stripPaletteIndexColors,
} from '../PaletteWithCustomColor/PaletteWithCustomColor';

import './DialogColorPalette.scss';

const b = block('dialog-color-palette');

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
    onPaletteItemClick: (color: string, index?: number) => void;
    setPaletteState: (newPaletteState: Partial<PaletteState>) => void;
    extra: ExtraSettings;
    colorPalettes: ColorPalette[];
    colorsList: string[];
    colorSectionFields?: Field[];
}

export class PaletteContainer extends React.Component<Props> {
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

        return <ColorValueItem colorsList={colorsList} color={mountedColor} />;
    };

    renderPaletteContainer = () => {
        const {mountedColors, selectedValue, polygonBorders, palette} = this.props.paletteState;
        const {extra, colorPalettes, colorsList} = this.props;

        return (
            <div className={b('palette-container')}>
                <ColorPaletteSelect
                    className={b('palette-select')}
                    qa="palette-select"
                    colorPalettes={colorPalettes}
                    onUpdate={([selectedPalette]) => {
                        this.props.setPaletteState({
                            palette: selectedPalette ?? undefined,
                            mountedColors: stripPaletteIndexColors(mountedColors),
                        });
                    }}
                    value={palette}
                    withAuto={true}
                />
                <PaletteWithCustomColor
                    key={palette}
                    className={b('palette')}
                    currentMountedColor={mountedColors[selectedValue!]}
                    selectedValue={selectedValue}
                    colorsList={colorsList}
                    onPaletteItemClick={this.props.onPaletteItemClick}
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
