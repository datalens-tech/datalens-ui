import React from 'react';

import {Check, Xmark} from '@gravity-ui/icons';
import {Button, Icon, Select, SelectOption} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {addAlias} from '../../../../helpers';
import {AliasesContext} from '../../../../hooks/useRelations';
import {DashkitMetaDataItem, DatasetsListData} from '../../../../types';

import {isAddingAliasExists, isAddingAliasSameDataset} from './helpers';

import './AddAliases.scss';

const i18n = I18n.keyset('component.dialog-relations.view');

type AddAliasesProps = {
    widget: DashkitMetaDataItem;
    currentRow: DashkitMetaDataItem;
    currentAliases: string[][];
    onCancel: () => void;
    onAdd: (aliases: string[]) => void;
    widgetIcon: React.ReactNode;
    rowIcon: React.ReactNode;
    error?: string;
};

const b = block('dialog-aliases-add');

const getList = (data: DashkitMetaDataItem) => {
    const dataset = data.datasets?.length ? data.datasets[0] : null;

    let res = [];

    if (dataset?.fieldsList) {
        res = dataset?.fieldsList.map((item) => ({
            content: item.title,
            value: item.guid,
        }));
    } else {
        res = data.usedParams?.map((item) => ({content: item, value: item})) || [];
    }

    return res;
};

const getFieldName = (data: DashkitMetaDataItem, selectedItem?: SelectOption) => {
    const datasetFileds = data.datasets?.length ? data.datasets[0]?.fieldsList : null;
    if (!datasetFileds) {
        return <div>{selectedItem?.value || ''}</div>;
    }
    return (
        <div>
            {datasetFileds.find((item) => item.guid === selectedItem?.value)?.title ||
                selectedItem?.value ||
                ''}
        </div>
    );
};

const getDatasetName = (data: DashkitMetaDataItem, datasets: DatasetsListData | null) => {
    const dataset = data.datasets?.length ? data.datasets[0] : null;

    if (!dataset || !datasets) {
        return '';
    }
    const datasetId = data.datasetId || dataset.id;
    return (datasetId in datasets && datasets[datasetId].name) || '';
};

const prepareData = (data: DashkitMetaDataItem, datasets: DatasetsListData | null) => {
    const options = getList(data);

    options.sort((prevItem, item) => prevItem.content.localeCompare(item.content));

    const name = getDatasetName(data, datasets);
    const subTitle = name ? `${data.title || data.label} (${name})` : data.title || data.label;

    return {options, subTitle};
};

export const AddAliases = ({
    widget,
    currentRow,
    currentAliases,
    onCancel,
    onAdd,
    widgetIcon,
    rowIcon,
    error,
}: AddAliasesProps) => {
    const {datasets} = React.useContext(AliasesContext);
    const [errorMsg, setErrorMgs] = React.useState<string>('');

    const [leftAliasSelected, setLeftAliasSelected] = React.useState<string[] | undefined>();
    const [rightAliasSelected, setRightAliasSelected] = React.useState<string[] | undefined>();

    const {options: currentItemOptions, subTitle: leftAliasSubTitle} = prepareData(
        widget,
        datasets,
    );
    const {options: rowItemOptions, subTitle: rightAliasSubTitle} = prepareData(
        currentRow,
        datasets,
    );

    const handleSelectLeftAlias = React.useCallback((value) => {
        setLeftAliasSelected(value);
    }, []);

    const handleSelectRightAlias = React.useCallback((value) => {
        setRightAliasSelected(value);
    }, []);

    const handleAddAlias = React.useCallback(() => {
        setErrorMgs('');

        if (leftAliasSelected === undefined || rightAliasSelected === undefined) {
            setErrorMgs(i18n('label_choose-fields-from-list'));
            return;
        }

        let newAlias: string[] = [];
        if (Array.isArray(leftAliasSelected)) {
            newAlias = [...newAlias, ...leftAliasSelected];
        } else {
            newAlias.push(leftAliasSelected);
        }
        if (Array.isArray(rightAliasSelected)) {
            newAlias = [...newAlias, ...rightAliasSelected];
        } else {
            newAlias.push(rightAliasSelected);
        }
        newAlias.sort();

        if (newAlias[0] === newAlias[1]) {
            setErrorMgs(i18n('label_alias-same-dataset-field'));
            return;
        }

        for (let i = 0; i < currentAliases.length; i++) {
            if (isAddingAliasExists(currentAliases[i], newAlias)) {
                setErrorMgs(i18n('label_alias-already-exists'));
                return;
            }
        }

        const addedAliases = addAlias(newAlias[0], newAlias[1], [...currentAliases]);

        if (isAddingAliasSameDataset(addedAliases, datasets)) {
            setErrorMgs(i18n('label_alias-same-dataset'));
            return;
        }

        onAdd(newAlias);
        setLeftAliasSelected(undefined);
        setRightAliasSelected(undefined);
    }, [currentAliases, leftAliasSelected, rightAliasSelected, onAdd, datasets]);

    React.useEffect(() => {
        if (!error?.trim()) {
            return;
        }
        setErrorMgs(error);
    }, [error]);

    return (
        <div className={b()}>
            <div className={b('row')}>
                <div className={b('select-wrap')}>
                    <div className={b('sub-title')} title={leftAliasSubTitle}>
                        {widgetIcon}
                        {leftAliasSubTitle}
                    </div>
                    <Select
                        hasClear={true}
                        filterable={true}
                        size="m"
                        options={currentItemOptions}
                        className={b('select')}
                        placeholder={i18n('label_choose-field-for-alias')}
                        onUpdate={handleSelectLeftAlias}
                        value={leftAliasSelected === undefined ? [] : leftAliasSelected}
                        popupClassName={b('dialog-popup')}
                        renderSelectedOption={(value) => getFieldName(widget, value)}
                    />
                </div>

                <span className={b('eq')}>=</span>
                <div className={b('select-wrap')}>
                    <div className={b('sub-title')} title={rightAliasSubTitle}>
                        {rowIcon}
                        {rightAliasSubTitle}
                    </div>
                    <Select
                        hasClear={true}
                        filterable={true}
                        size="m"
                        options={rowItemOptions}
                        className={b('select')}
                        placeholder={i18n('label_choose-field-for-alias')}
                        onUpdate={handleSelectRightAlias}
                        value={rightAliasSelected === undefined ? [] : rightAliasSelected}
                        popupClassName={b('dialog-popup')}
                        renderSelectedOption={(value) => getFieldName(currentRow, value)}
                    />
                </div>

                <Button className={b('button')} view="normal" onClick={handleAddAlias}>
                    <Icon data={Check} />
                </Button>

                <Button className={b('button')} view="normal" onClick={onCancel}>
                    <Icon data={Xmark} />
                </Button>
            </div>
            {errorMsg && <div className={b('error')}>{errorMsg}</div>}
        </div>
    );
};
