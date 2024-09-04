import React from 'react';

import {Button, Select} from '@gravity-ui/uikit';
import type {SelectOption, SelectRenderControlProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import type {DatasetFieldAggregation} from 'shared';

import {getSelectedValueForSelect} from '../../../../../../utils/helpers';
import {AGGREGATION_AUTO, AGGREGATION_NONE} from '../../../../constants';
import {datasetValidationSelector} from '../../../../store/selectors/dataset';
import {getLabelValue} from '../../utils';

import './AggregationSelect.scss';

const b = block('aggregation-select');

interface AggregationSelectProps {
    selectedAggregation: string;
    aggregations: string[];
    autoaggregated?: boolean;
    onSelect: (value: DatasetFieldAggregation) => void;
}

export const AggregationSelect: React.FC<AggregationSelectProps> = ({
    selectedAggregation: initSelectedAggregation,
    aggregations,
    autoaggregated,
    onSelect,
}) => {
    const [selectedAggregation, setSelectedAggregation] = React.useState(initSelectedAggregation);
    const validation = useSelector(datasetValidationSelector);

    React.useEffect(() => {
        setSelectedAggregation(initSelectedAggregation);
    }, [initSelectedAggregation]);

    const aggregationList = () => {
        return aggregations
            .map<SelectOption>((aggregation) => {
                const aggregationTitle = getAggregationTitle(
                    aggregation as DatasetFieldAggregation,
                );

                return {
                    value: aggregation,
                    content: getLabelValue(aggregationTitle),
                    disabled: validation.isLoading,
                };
            })
            .sort((current, next) => {
                const content = current.content as string;
                const value = current.value;

                const contentNext = next.content as string;
                const valueNext = next.value;

                if ([value, valueNext].includes(AGGREGATION_NONE)) {
                    return 1;
                }

                return content.localeCompare(contentNext, undefined, {numeric: true});
            });
    };

    const type = () => {
        return selectedAggregation === AGGREGATION_NONE && !autoaggregated
            ? 'dimension'
            : 'measure';
    };

    const disabled = () => {
        // CHARTS-2870#5eeba2a02b0f671b59207dd8
        return aggregations.length === 1 && aggregations[0] === selectedAggregation;
    };

    function getAggregationTitle(aggregation: DatasetFieldAggregation) {
        if (aggregation === AGGREGATION_NONE && autoaggregated) {
            return AGGREGATION_AUTO;
        }

        return aggregation;
    }

    const handleOnSelect = (value: [DatasetFieldAggregation]) => {
        const [aggregation] = value;

        setSelectedAggregation(aggregation);
        onSelect(aggregation);
    };

    const renderSelectControl = ({onClick, ref, onKeyDown}: SelectRenderControlProps) => {
        const selectedValue = getSelectedValueForSelect([selectedAggregation], aggregations);

        const [aggregation] = selectedValue as [DatasetFieldAggregation];
        const aggregationTitle = getAggregationTitle(aggregation);

        return (
            <Button
                onClick={onClick}
                ref={ref}
                extraProps={{onKeyDown}}
                view="flat"
                className={b('select-control', {[type()]: true})}
            >
                <span className={b('selected-value')}>{getLabelValue(aggregationTitle)}</span>
            </Button>
        );
    };

    const renderSelectOption = (option: SelectOption) => {
        const modifiers = {
            disabled: option.disabled,
        };
        return <span className={b('select-option', modifiers)}>{option.content}</span>;
    };

    return (
        <Select
            disabled={disabled()}
            options={aggregationList()}
            value={[selectedAggregation]}
            onUpdate={(value) => handleOnSelect(value as [DatasetFieldAggregation])}
            renderControl={renderSelectControl}
            renderOption={renderSelectOption}
        />
    );
};
