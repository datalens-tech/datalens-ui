import React from 'react';

import {Check, Xmark} from '@gravity-ui/icons';
import type {SelectOption} from '@gravity-ui/uikit';
import {Button, Icon, Link, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {DashCommonQa} from 'shared';
import {Interpolate} from 'ui/components/Interpolate';
import {DL} from 'ui/constants/common';

import {addAlias} from '../../../../helpers';
import {isEditorChart} from '../../../../hooks/helpersChart';
import {isControl, isExternalControl} from '../../../../hooks/helpersControls';
import {AliasesContext} from '../../../../hooks/useRelations';
import type {DashkitMetaDataItem, DatasetsListData} from '../../../../types';
import {AliasesInvalidList} from '../AliasesList/AliasesInvalidList';

import {getParamsSelectOptions, hasAliasWithSameDataset, isAddingAliasExists} from './helpers';

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

    if (dataset?.fieldsList && !data.isQL) {
        res = dataset?.fieldsList
            .filter((item) => (isControl(data) ? item.guid in (data.defaultParams || {}) : true))
            .map((item) => ({
                content: item.title,
                value: item.guid,
            }));
    } else {
        // if there is no defaults in editor chart or in external selector there is no params for list options
        // until user add any param to default
        if (isEditorChart(data)) {
            return !data.params || isEmpty(data.params)
                ? []
                : Object.keys(data.params).map(getParamsSelectOptions);
        } else if (isExternalControl(data)) {
            return !data.widgetParams || isEmpty(data.widgetParams)
                ? []
                : Object.keys(data.widgetParams).map(getParamsSelectOptions);
        }
        res = data.usedParams?.map(getParamsSelectOptions) || [];
    }

    return res;
};

const getFieldName = (data: DashkitMetaDataItem, selectedItem?: SelectOption) => {
    const datasetFields = data.datasets?.length && !data.isQL ? data.datasets[0]?.fieldsList : null;
    if (!datasetFields) {
        return <div>{selectedItem?.value || ''}</div>;
    }
    return (
        <div>
            {datasetFields.find((item) => item.guid === selectedItem?.value)?.title ||
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
    const [errorAliases, setErrorAliases] = React.useState<{
        alias: string[];
        errors: string[];
    } | null>(null);

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
        const sameDatasetAlias = hasAliasWithSameDataset(addedAliases, datasets);

        if (sameDatasetAlias) {
            setErrorMgs(i18n('label_alias-same-dataset'));
            setErrorAliases(sameDatasetAlias);
            return;
        } else {
            setErrorAliases(null);
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

    if (!currentItemOptions.length || !rowItemOptions.length) {
        const hasExternalControl = isExternalControl(widget) || isExternalControl(currentRow);
        const keyset = hasExternalControl
            ? i18n('label_need-default-external-control')
            : i18n('label_need-default-editor-chart');
        const linkParam = hasExternalControl
            ? '/editor/widgets/selector/external'
            : '/operations/chart/add-parameters';

        return (
            <div className={b()}>
                <Interpolate
                    text={keyset}
                    matches={{
                        link: (match) => (
                            <React.Fragment>
                                <Link
                                    href={`${DL.ENDPOINTS.datalensDocs}${linkParam}`}
                                    target="_blank"
                                >
                                    {match}
                                </Link>
                            </React.Fragment>
                        ),
                    }}
                />
            </div>
        );
    }

    return (
        <div className={b()}>
            <div className={b('row')}>
                <div className={b('select-wrap')}>
                    <div className={b('sub-title')} title={leftAliasSubTitle}>
                        <div className={b('icon')}>{widgetIcon}</div>
                        {leftAliasSubTitle}
                    </div>
                    <Select
                        filterable={true}
                        size="m"
                        options={currentItemOptions}
                        className={b('select')}
                        placeholder={i18n('label_choose-field-for-alias')}
                        onUpdate={handleSelectLeftAlias}
                        value={leftAliasSelected === undefined ? [] : leftAliasSelected}
                        popupClassName={b('dialog-popup')}
                        renderSelectedOption={(value) => getFieldName(widget, value)}
                        qa={DashCommonQa.AliasSelectLeft}
                    />
                </div>

                <span className={b('eq')}>=</span>
                <div className={b('select-wrap')}>
                    <div className={b('sub-title')} title={rightAliasSubTitle}>
                        <div className={b('icon')}>{rowIcon}</div>
                        {rightAliasSubTitle}
                    </div>
                    <Select
                        filterable={true}
                        size="m"
                        options={rowItemOptions}
                        className={b('select')}
                        placeholder={i18n('label_choose-field-for-alias')}
                        onUpdate={handleSelectRightAlias}
                        value={rightAliasSelected === undefined ? [] : rightAliasSelected}
                        popupClassName={b('dialog-popup')}
                        renderSelectedOption={(value) => getFieldName(currentRow, value)}
                        qa={DashCommonQa.AliasSelectRight}
                    />
                </div>

                <Button className={b('button')} view="normal" onClick={onCancel}>
                    <Icon data={Xmark} />
                </Button>

                <Button
                    className={b('button')}
                    view="action"
                    onClick={handleAddAlias}
                    qa={DashCommonQa.AliasAddBtn}
                >
                    <Icon data={Check} />
                </Button>
            </div>
            {errorMsg && <div className={b('error')}>{errorMsg}</div>}
            {errorAliases && (
                <AliasesInvalidList
                    aliases={[errorAliases.alias]}
                    invalidAliases={errorAliases.errors}
                    datasets={datasets}
                />
            )}
        </div>
    );
};
