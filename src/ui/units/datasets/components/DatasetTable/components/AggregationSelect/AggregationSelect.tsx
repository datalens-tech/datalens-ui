import React from 'react';

import {Button, Select} from '@gravity-ui/uikit';
import type {SelectOption, SelectRenderControlProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {DatasetField, DatasetFieldAggregation} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {getDatasetLabelValue, getSelectedValueForSelect} from '../../../../../../utils/helpers';
import {AGGREGATION_AUTO, AGGREGATION_NONE} from '../../../../constants';
import {datasetValidationSelector} from '../../../../store/selectors/dataset';

import './AggregationSelect.scss';

const b = block('aggregation-select');

type StateProps = ReturnType<typeof mapStateToProps>;

type OwnProps = {
    selectedAggregation: string;
    aggregations: string[];
    field: DatasetField;
    onSelect: (row: DatasetField, value: DatasetFieldAggregation) => void;
    tabIndex?: number;
    debounceTimeout?: number;
};

type Props = StateProps & OwnProps;

class AggregationSelectComponent extends React.Component<Props> {
    _aggregationSelectRef = React.createRef<any>();

    render() {
        const {field, selectedAggregation} = this.props;

        return (
            <Select
                ref={this._aggregationSelectRef}
                disabled={this.disabled}
                options={this.aggregationList}
                value={[selectedAggregation]}
                onUpdate={(value) => this.onSelect(field, value as [DatasetFieldAggregation])}
                renderControl={this.renderSelectControl}
                renderOption={this.renderSelectOption}
            />
        );
    }

    get aggregations() {
        return this.props.aggregations.includes(AGGREGATION_NONE)
            ? this.props.aggregations
            : [AGGREGATION_NONE, ...this.props.aggregations];
    }

    get aggregationList() {
        const {validation} = this.props;

        return this.aggregations
            .map<SelectOption>((aggregation) => {
                const aggregationTitle = this.getAggregationTitle(
                    aggregation as DatasetFieldAggregation,
                );

                return {
                    value: aggregation,
                    content: getDatasetLabelValue(aggregationTitle),
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
    }

    get type() {
        const {selectedAggregation, field: {autoaggregated} = {}} = this.props;

        return selectedAggregation === AGGREGATION_NONE && !autoaggregated
            ? 'dimension'
            : 'measure';
    }

    get disabled() {
        const {aggregations, selectedAggregation} = this.props;

        // CHARTS-2870#5eeba2a02b0f671b59207dd8
        return aggregations.length === 1 && aggregations[0] === selectedAggregation;
    }

    private getAggregationTitle = (aggregation: DatasetFieldAggregation) => {
        const {field} = this.props;

        if (aggregation === AGGREGATION_NONE && field?.autoaggregated) {
            return AGGREGATION_AUTO;
        }

        return aggregation;
    };

    private onSelect = (row: DatasetField, value: [DatasetFieldAggregation]) => {
        // TODO: look for correct approach to close popup in dropdown by click on item in it
        if (this._aggregationSelectRef.current) {
            const {_onSwitcherClick} = this._aggregationSelectRef.current;

            if (_onSwitcherClick) {
                _onSwitcherClick();
            }
        }
        const [aggregation] = value;
        this.props.onSelect(row, aggregation);
    };

    private renderSelectControl = ({ref, triggerProps}: SelectRenderControlProps) => {
        const selectedValue = getSelectedValueForSelect(
            [this.props.selectedAggregation],
            this.aggregations,
        );

        const [aggregation] = selectedValue as [DatasetFieldAggregation];
        const aggregationTitle = this.getAggregationTitle(aggregation);

        return (
            <Button
                onClick={triggerProps.onClick}
                ref={ref}
                onKeyDown={triggerProps.onKeyDown}
                view="flat"
                className={b('select-control', {[this.type]: true})}
            >
                <span className={b('selected-value')}>
                    {getDatasetLabelValue(aggregationTitle)}
                </span>
            </Button>
        );
    };

    private renderSelectOption = (option: SelectOption) => {
        const modifiers = {
            disabled: option.disabled,
        };
        return <span className={b('select-option', modifiers)}>{option.content}</span>;
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        validation: datasetValidationSelector(state),
    };
};

export const AggregationSelect = connect(mapStateToProps)(AggregationSelectComponent);
