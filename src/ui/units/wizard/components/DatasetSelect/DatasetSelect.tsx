import React from 'react';

import {ChevronDown, CirclesIntersection, Plus} from '@gravity-ui/icons';
import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {Dataset, DatasetApiError} from 'shared';
import {Feature, SectionDatasetQA} from 'shared';
import type {DataLensApiError} from 'ui';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import DatasetSelectItem from './DatasetSelectItem';

import './DatasetSelect.scss';

const b = block('dataset-select');

export interface DatasetSelectProps {
    dataset?: Dataset;
    datasets?: Dataset[];
    datasetApiErrors: DatasetApiError[];
    isPopupVisible: boolean;
    onChange: (value: Dataset) => void;
    onPreselectClick: () => void;

    onOpenDatasetClick: (id: string) => void;
    onAddDatasetClick: () => void;
    onReplaceDatasetClick: (id: string) => void;
    openDialogMultidataset: ({initedDataset}: {initedDataset?: Dataset}) => void;
    onRemoveDatasetClick: (id: string) => void;
    toggleNavigation: (isOpen: boolean) => void;
}

interface DatasetSelectState {
    isOpen: boolean;
}

const DatasetIcon = () => {
    return (
        <div className={b('icon-container')}>
            <Icon data={CirclesIntersection} size={18} />
        </div>
    );
};

class DatasetSelect extends React.Component<DatasetSelectProps, DatasetSelectState> {
    constructor(props: DatasetSelectProps) {
        super(props);

        this.state = {
            isOpen: Boolean(props.datasetApiErrors.length),
        };
    }

    render() {
        const {datasets, datasetApiErrors} = this.props;
        const shouldShowSelect = datasets?.length || Object.keys(datasetApiErrors).length;

        return (
            <div className={b()}>
                <div className={b('content')}>
                    {shouldShowSelect ? this.getSelect() : this.getPreselect()}
                </div>
            </div>
        );
    }

    getSelect() {
        const {dataset} = this.props;
        const {isOpen} = this.state;

        return (
            <React.Fragment>
                <DatasetSelectItem
                    onClick={this.onSelectClick}
                    icon={
                        <Icon
                            data={ChevronDown}
                            className={b('icon', {rotated: isOpen})}
                            size={20}
                        />
                    }
                    label={i18n('wizard', 'dataset-selector_label')}
                    description={dataset?.realName}
                    items={this.getDatasetItemActions(dataset?.id)}
                    qaRole={'dataset-select'}
                />

                {this.getSelectItems()}
            </React.Fragment>
        );
    }

    private onSelectClick = () => {
        if (this.state.isOpen && this.props.isPopupVisible) {
            this.props.toggleNavigation(false);
        }
        this.setState({
            isOpen: !this.state.isOpen,
        });
    };

    private getSelectItems() {
        const {onChange, datasets = [], dataset, datasetApiErrors} = this.props;
        const {isOpen} = this.state;

        if (!isOpen) {
            return null;
        }

        return (
            <React.Fragment>
                {datasets.map((el) => (
                    <DatasetSelectItem
                        key={`${el.id}`}
                        icon={<DatasetIcon />}
                        onClick={onChange.bind(null, el)}
                        label={el.realName}
                        items={this.getDatasetItemActions(el.id)}
                        secondary={true}
                        selected={el === dataset}
                    />
                ))}
                {datasetApiErrors.map(({datasetId, error}) => {
                    return (
                        <DatasetSelectItem
                            key={datasetId}
                            icon={<DatasetIcon />}
                            label={datasetId}
                            items={this.getDatasetItemActions(datasetId)}
                            secondary={true}
                            error={error as DataLensApiError}
                        />
                    );
                })}
                {isEnabledFeature(Feature.HideMultiDatasets) ? null : (
                    <DatasetSelectItem
                        icon={<Icon data={Plus} className={b('icon')} size={20} />}
                        label={i18n('wizard', 'button_add-dataset')}
                        secondary={true}
                        qaRole={SectionDatasetQA.AddDatasetButton}
                        onClick={this.props.onAddDatasetClick}
                    />
                )}
            </React.Fragment>
        );
    }

    private getPreselect() {
        const {onPreselectClick} = this.props;
        return (
            <Button
                className={b('preselect-button')}
                view="flat"
                pin="brick-brick"
                size="l"
                qa={SectionDatasetQA.DatasetSelect}
                onClick={onPreselectClick}
            >
                <div className={b('container')}>
                    {<DatasetIcon />}
                    {i18n('wizard', 'button_choose-dataset')}
                </div>
            </Button>
        );
    }

    private getDatasetItemActions(datasetId?: string): DropdownMenuItemMixed<any>[] {
        if (!datasetId) {
            return [];
        }

        const {datasets = [], datasetApiErrors} = this.props;
        const isError = datasetApiErrors.some((item) => item.datasetId === datasetId);

        return [
            {
                action: () => this.props.onOpenDatasetClick(datasetId),
                text: i18n('wizard', 'button_to-dataset'),
                qa: SectionDatasetQA.GoToDatasetButton,
            },
            {
                action: () => this.props.onReplaceDatasetClick(datasetId),
                text: i18n('wizard', 'button_replace-dataset'),
                qa: SectionDatasetQA.ReplaceDatasetButton,
            },
            {
                action: () => this.props.onRemoveDatasetClick(datasetId),
                text: i18n('wizard', 'button_remove-dataset'),
                hidden: datasets.length <= 1 && !isError,
                qa: SectionDatasetQA.RemoveDatasetButton,
            },
            {
                action: () => this.props.openDialogMultidataset({}),
                text: i18n('wizard', 'button_datasets-settings'),
                hidden: datasets.length <= 1,
                qa: SectionDatasetQA.SettingsDatasetButton,
            },
        ];
    }
}

export default DatasetSelect;
