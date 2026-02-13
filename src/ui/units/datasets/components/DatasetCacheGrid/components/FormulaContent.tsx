import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import type {Dataset, DatasetOptions} from 'shared';
import {DIALOG_FIELD_EDITOR} from 'ui/components/DialogFieldEditor/DialogFieldEditor';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';

import {getEarlyInvalidationCacheMockText} from '../../../helpers/mockTexts';
import {
    datasetCacheFieldSelector,
    datasetCacheFilterSelector,
    datasetContentSelector,
    datasetIdSelector,
    filteredDatasetFieldsSelector,
    optionsSelector,
    workbookIdSelector,
} from '../../../store/selectors';
import {DatasetTabFieldList} from '../../DatasetTabFieldList/DatasetTabFieldList';
import {useFilterSection} from '../../FilterSection/useFilterSection';

import {CacheParameterRow} from './CacheParameterRow';
import {LastResultRow} from './LastResultRow';
import {Row} from './Row';

import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';

type FormulaContentProps = {
    readonly: boolean;
};

export const FormulaContent = ({readonly}: FormulaContentProps) => {
    const dispatch = useDispatch();
    const filters = useSelector(datasetCacheFilterSelector);
    const formula = useSelector(datasetCacheFieldSelector);
    const datasetContent = useSelector(datasetContentSelector);
    const workbookId = useSelector(workbookIdSelector);
    const fields = useSelector(filteredDatasetFieldsSelector);
    const datasetOptions = useSelector(optionsSelector);
    const datasetId = useSelector(datasetIdSelector);

    const {
        columns,
        controlSettings,
        onOpenDialogFilterClick,
        headerColumns,
        onFilterItemClick,
        preparedFields,
        checkIsRowValid,
    } = useFilterSection({
        readonly,
        addFilter: () => {},
        deleteFilter: () => {},
        options: datasetOptions,
        updateFilter: () => {},
        fields,
        filters,
    });

    const openDialogHandler = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_FIELD_EDITOR,
                props: {
                    onlyFormulaEditor: true,
                    field: formula,
                    fields,
                    workbookId,
                    datasetContent: datasetContent as Dataset['dataset'],
                    datasetOptions: datasetOptions as DatasetOptions,
                    datasetId,
                    staticTitle: getEarlyInvalidationCacheMockText('formula-row-label'),
                    onClose: () => dispatch(closeDialog()),
                    onSave: () => {},
                    onCreate: () => {},
                    applyBtnText: getEarlyInvalidationCacheMockText(
                        'formula-dialog-apply-btn-text',
                    ),
                    additionalFooterContent: (
                        <Button size="l">
                            {getEarlyInvalidationCacheMockText('dataset-cache-tab-confirm-btn')}
                        </Button>
                    ),
                },
            }),
        );
    }, [dispatch, fields, formula, workbookId, datasetContent, datasetId, datasetOptions]);

    return (
        <React.Fragment>
            <CacheParameterRow
                readonly={readonly}
                label={getEarlyInvalidationCacheMockText('formula-row-label')}
                onAdd={openDialogHandler}
                onEdit={openDialogHandler}
                onDelete={() => {}}
                parameterExist={Boolean(formula)}
            />
            <LastResultRow readonly={readonly} />
            <Row label={getEarlyInvalidationCacheMockText('filter-row-label')}>
                <DatasetTabFieldList
                    readonly={readonly}
                    onItemClick={onFilterItemClick}
                    fields={preparedFields}
                    headerColumns={headerColumns}
                    columns={columns}
                    isLoading={false}
                    controlSettings={controlSettings}
                    checkIsRowValid={checkIsRowValid}
                />
                <Button disabled={readonly} onClick={onOpenDialogFilterClick}>
                    <Icon data={PlusIcon} />
                    {getEarlyInvalidationCacheMockText('add-filter-btn-text')}
                </Button>
            </Row>
        </React.Fragment>
    );
};
