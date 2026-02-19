import React from 'react';

import block from 'bem-cn-lite';

import {isHexColor} from '../ColorPickerInput/utils';

import './ColorValueItem.scss';

type ColorValueItemProps = {
    colorsList: string[];
    color?: string;
    qa?: string;
};

const b = block('color-value-item');

export const ColorValueItem = ({colorsList, color, qa}: ColorValueItemProps) => {
    const backgroundColor = colorsList[Number(color)] || color;
    const isHexWithOpacity = color && isHexColor(color) && color.length > 7;
    const style = {
        background: isHexWithOpacity
            ? `linear-gradient(90deg, ${color.slice(0, -2)} 50%, ${color} 50%)`
            : backgroundColor,
    };

    return (
        <div className={b({default: !color})}>
            {color ? <div className={b('background')} style={style} data-qa={qa} /> : 'a'}
        </div>
    );
};
