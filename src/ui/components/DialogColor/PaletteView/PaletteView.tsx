import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import omit from 'lodash/omit';
import {ColorPalette, DialogColorQa} from 'shared';
import {selectPalette} from 'ui';

import Palette from '../../Palette/Palette';
import {PaletteTypes} from '../../Palette/constants';
import {PaletteSelect} from '../../PaletteSelect/PaletteSelect';
import {ValueList} from '../ValueList/ValueList';
import type {ColoredValue} from '../types';

import './PaletteView.scss';

const b = block('dialog-color');

export const DEFAULT_COLOR = 'auto';

type Props = {
    colorPalettes: ColorPalette[];
    palette: string | undefined;
    values: string[];
    loading?: boolean;
    mountedColors: Record<string, string>;
    onChange: (args: {palette: string; mountedColors: Record<string, string>}) => void;
};

export const PaletteView = (props: Props) => {
    const {colorPalettes, palette, mountedColors, values, loading, onChange} = props;
    const [searchValue, setSearchValue] = React.useState('');
    const [selectedValue, selectValue] = React.useState('');
    const selectedPaletteId = palette || colorPalettes[0]?.colorPaletteId;
    const colorsList = (
        colorPalettes.find((p) => p.colorPaletteId === palette)?.colors ||
        selectPalette(selectedPaletteId)
    ).concat([DEFAULT_COLOR]);

    const handleSelectPalette = (value: string) => {
        onChange({palette: value, mountedColors: {}});
    };

    const selectColor = (_color: string, colorIndex: number) => {
        const isDefaultColor = !colorsList[colorIndex] || colorsList[colorIndex] === 'auto';
        const prevValue = mountedColors[selectedValue];

        if (prevValue && isDefaultColor) {
            onChange({
                palette: selectedPaletteId,
                mountedColors: omit(mountedColors, selectedValue),
            });
            return;
        }

        if (prevValue !== String(colorIndex) && !isDefaultColor) {
            onChange({
                palette: selectedPaletteId,
                mountedColors: {...mountedColors, [selectedValue]: String(colorIndex)},
            });
        }
    };

    const items: ColoredValue[] = values.map((value) => ({
        value,
        color: colorsList[Number(mountedColors[value])],
    }));

    return (
        <div className={b('palette-section')}>
            <div className={b('values-container')}>
                <div className={b('values-search')}>
                    <TextInput
                        size="m"
                        placeholder={i18n('wizard', 'field_search')}
                        value={searchValue}
                        onUpdate={setSearchValue}
                    />
                </div>
                <div className={b('values-list')}>
                    <ValueList
                        query={searchValue}
                        selected={selectedValue}
                        items={items}
                        loading={loading}
                        onSelect={selectValue}
                    />
                </div>
            </div>
            <div className={b('palette-container')}>
                <PaletteSelect
                    qa={DialogColorQa.PaletteSelect}
                    value={selectedPaletteId}
                    palettes={colorPalettes}
                    onChange={handleSelectPalette}
                />
                <Palette
                    paletteType={PaletteTypes.Colors}
                    className={b('palette')}
                    onPaletteItemClick={selectColor}
                    isSelectedItem={(color, index) => {
                        const selectedColor = mountedColors[selectedValue] || DEFAULT_COLOR;
                        return selectedColor === String(index) || selectedColor === color;
                    }}
                    isDefaultItem={(color) => color === DEFAULT_COLOR}
                    palette={colorsList}
                />
            </div>
        </div>
    );
};
