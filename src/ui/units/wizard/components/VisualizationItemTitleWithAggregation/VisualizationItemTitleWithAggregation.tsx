import React from 'react';

import block from 'bem-cn-lite';
import type {Field} from 'shared';

import './VisualizationItemTitleWithAggregation.scss';

type VisualizationItemTitleProps = {
    field: Field;
    isDisabled?: boolean;
};

const b = block('visualization-item-aggregation-title');

export const VisualizationItemTitleWithAggregation = ({
    field,
    isDisabled,
}: VisualizationItemTitleProps) => {
    const mods = {
        disabled: isDisabled,
    };

    const aggregation = field.aggregation === 'countunique' ? 'countd' : field.aggregation;

    return (
        <span>
            <span className={b('wrapper', mods)}>{aggregation}(</span>
            {field.fakeTitle || field.title}
            <span className={b('wrapper', mods)}>)</span>
        </span>
    );
};
