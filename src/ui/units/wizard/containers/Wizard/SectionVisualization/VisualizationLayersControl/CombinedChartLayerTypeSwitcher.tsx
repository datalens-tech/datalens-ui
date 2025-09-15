import React, {useCallback} from 'react';

import {Icon, SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {VisualizationLayerType} from 'shared';
import {VISUALIZATION_IDS} from 'units/wizard/constants';
import {selectSubVisualization} from 'units/wizard/selectors/visualization';

import {changeVisualizationLayerType} from '../../../../actions';

import iconVisArea from 'ui/assets/icons/vis-area.svg';
import iconVisColumn from 'ui/assets/icons/vis-column.svg';
import iconVisLines from 'ui/assets/icons/vis-lines.svg';

import './CombinedChartLayerTypeSwitcher.scss';

const b = block('combined-chart-layer-type-switcher');

type CombinedChartLayerTypeSwticherProps = {};

export const CombinedChartLayerTypeSwitcher: React.FC<CombinedChartLayerTypeSwticherProps> = () => {
    const currentVisualizationLayer = useSelector(selectSubVisualization);

    const dispatch = useDispatch();

    const changeVisualizationLayerTypeCallback = useCallback(
        (type: string) => {
            dispatch(changeVisualizationLayerType(type as VisualizationLayerType));
        },
        [dispatch],
    );

    if (!currentVisualizationLayer) {
        return null;
    }

    const options = [
        {
            value: VISUALIZATION_IDS.LINE,
            icon: iconVisLines,
        },
        {
            value: VISUALIZATION_IDS.COLUMN,
            icon: iconVisColumn,
        },
        {
            value: VISUALIZATION_IDS.AREA,
            icon: iconVisArea,
        },
    ].map(({value, icon}, index) => {
        return (
            <RadioButton.Option key={`${value}-${index}`} value={value}>
                <span className={b('item')}>
                    <Icon data={icon} size={20} />
                </span>
            </RadioButton.Option>
        );
    });

    return (
        <RadioButton
            size="m"
            value={currentVisualizationLayer.id as VisualizationLayerType}
            onUpdate={changeVisualizationLayerTypeCallback}
            className={b()}
        >
            {options}
        </RadioButton>
    );
};
