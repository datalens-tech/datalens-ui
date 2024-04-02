import React from 'react';

import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ColorPalette} from 'shared';

import {SelectOptionWithIcon} from '../SelectComponents';

import {getPaletteSelectorItems} from './utils';

import './PaletteSelect.scss';

const b = block('palette-select');

type Props = {
    qa?: string;
    value: string;
    palettes: ColorPalette[];
    onChange: (palette: string) => void;
};

export const PaletteSelect = (props: Props) => {
    const {qa, value, palettes, onChange} = props;
    const options = getPaletteSelectorItems({
        colorPalettes: palettes,
    });

    return (
        <Select
            qa={qa}
            value={[value]}
            options={options}
            className={b()}
            onUpdate={([palette]) => onChange(palette)}
            popupClassName={b('popup')}
            renderSelectedOption={(option) => {
                return <SelectOptionWithIcon option={option} />;
            }}
            renderOption={(option) => {
                return <SelectOptionWithIcon option={option} />;
            }}
        />
    );
};
