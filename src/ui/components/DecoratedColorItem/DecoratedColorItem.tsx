import React from 'react';

import type {RealTheme} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ColorItem} from './ColorItem/ColorItem';

import './DecoratedColorItem.scss';

const b = block('decorated-palette-color-item');

type DecoratedColorItemProps = {
    selected: boolean;
    showItemBorder?: boolean;
    theme?: RealTheme;
    color: string;
    previewRef?: (instance: HTMLDivElement | null) => void;
};

export const DecoratedColorItem = ({
    selected,
    showItemBorder,
    theme,
    color,
    previewRef,
}: DecoratedColorItemProps) => {
    return (
        <div
            className={b({
                selected,
                'with-border': showItemBorder,
            })}
        >
            <ColorItem
                color={color}
                isSelected={selected}
                ref={selected ? previewRef : undefined}
                theme={theme}
            />
        </div>
    );
};
