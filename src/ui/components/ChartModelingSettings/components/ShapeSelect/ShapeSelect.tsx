import React from 'react';

import {Select, type SelectOption} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {LineShapeType} from 'shared';
import {SHAPES_PALETTE_ORDER} from 'shared';
import {selectClientAvailableLineShapes} from 'ui/constants/common';

import {i18n} from '../../i18n';

import {getShapedLineIcon} from './utils';

const b = block('chart-modeling-settings');

function getShapeSelectOptions() {
    const availableLineShapes = selectClientAvailableLineShapes();
    const values = availableLineShapes.sort(
        (shape1, shape2) => SHAPES_PALETTE_ORDER[shape1] - SHAPES_PALETTE_ORDER[shape2],
    );

    const items: SelectOption[] = values.map((v) => ({value: v}));
    return items;
}

function renderShapeSelectOption({value, width}: {value: string; width: number}) {
    if (value === 'auto') {
        return <React.Fragment>{i18n('label_auto')}</React.Fragment>;
    }

    return (
        <div className={b('shape-select-icon')}>
            {getShapedLineIcon({shape: value as LineShapeType, width, height: 2})}
        </div>
    );
}

export const ShapeSelect = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (values: string[]) => void;
}) => {
    return (
        <Select
            value={[value]}
            onUpdate={onChange}
            options={getShapeSelectOptions()}
            renderOption={({value: item}) => renderShapeSelectOption({value: item, width: 112})}
            renderSelectedOption={({value: item}) =>
                renderShapeSelectOption({value: item, width: 80})
            }
            className={b('shape-select')}
        />
    );
};
