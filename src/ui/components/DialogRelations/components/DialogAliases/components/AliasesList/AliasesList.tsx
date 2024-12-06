import React from 'react';

import {Magnifier, TrashBin, Xmark} from '@gravity-ui/icons';
import type {ButtonView} from '@gravity-ui/uikit';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DashCommonQa} from 'shared';
import type {DatasetsFieldsListData} from 'ui/components/DashKit/plugins/types';

import {AliasesContext} from '../../../../hooks/useRelations';
import type {DatasetsListData, RelationsData} from '../../../../types';

import './AliasesList.scss';

const b = block('dialog-aliases-list');
const i18n = I18n.keyset('component.dialog-relations.view');

export type SelectParamArgs = {
    index: number | null;
    indexRow: number | null;
    aliasRow: string[];
    fieldName: string;
    field: DatasetsFieldsListData | null;
    isClickedOnSelected: boolean;
};

type AliasesListItemProps = AliasesListProps & {
    row: Array<string>;
    onSelectParam: (args: Omit<SelectParamArgs, 'isClickedOnSelected'>) => void;
    indexRow: number;
};

export const getFieldNameByGuid = (datasets: DatasetsListData | null, aliasItem: string) => {
    let dataset: {
        datasetId: string;
        datasetName: string;
        field: DatasetsFieldsListData;
    } | null = null;

    for (const [key, value] of Object.entries(datasets || {})) {
        const field = value?.fields.find((fieldItem) => fieldItem.guid === aliasItem) || null;
        if (field) {
            dataset = {
                datasetId: key,
                field,
                datasetName: value.name || '',
            };
            return dataset;
        }
    }

    return {
        datasetId: null,
        datasetName: null,
        field: null,
    };
};

const AliasesListItem = ({
    row,
    widgetId,
    onDetailClick,
    onRemoveClick,
    onSelectParam,
    indexRow,
}: AliasesListItemProps) => {
    const {datasets, selectedAliasRowIndex, selectedParam, invalidAliases} =
        React.useContext(AliasesContext);

    const handleRemoveAliasRow = React.useCallback(() => {
        onRemoveClick({
            row,
        });
    }, [onRemoveClick, row]);

    const isRowActive = selectedAliasRowIndex === indexRow;

    const handleRemoveAliasItemFromRow = React.useCallback(
        (index: number) => {
            const rowWithPartlyRemoved: string[] = [];

            row.forEach((item, itemRowIndex) => {
                if (index !== itemRowIndex) {
                    rowWithPartlyRemoved.push(item);
                }
            });

            onRemoveClick({
                row,
                rowWithPartlyRemoved,
            });
        },
        [onRemoveClick, row],
    );

    return (
        <div className={b('row', {active: isRowActive})}>
            <div className={b('left')}>
                {row.map((aliasItem, index, array) => {
                    const {datasetId, field, datasetName} = getFieldNameByGuid(datasets, aliasItem);
                    const datasetText = datasetId
                        ? ` (${i18n('label_dataset')}: ${datasetName ? datasetName : datasetId})`
                        : '';
                    const fieldName = field?.title || aliasItem;
                    const isAliasItemSelected = selectedParam === aliasItem && isRowActive;

                    const isInvalidItem = invalidAliases?.includes(aliasItem);
                    let buttonView: ButtonView = 'outlined';
                    if (isInvalidItem) {
                        buttonView = 'outlined-danger';
                    } else if (isAliasItemSelected) {
                        buttonView = 'outlined-info';
                    }

                    // partly remove item from alias for more than 2 items in row
                    const showRemoveItemIcon = isAliasItemSelected && array.length > 2;

                    return (
                        <React.Fragment key={`alias-row-${widgetId}-${aliasItem}`}>
                            <Button
                                className={b('alias-button')}
                                view={buttonView}
                                size="m"
                                onClick={() =>
                                    onSelectParam({
                                        index,
                                        indexRow,
                                        aliasRow: row,
                                        fieldName: `${fieldName}${datasetText}`,
                                        field,
                                    })
                                }
                                qa={DashCommonQa.AliasItem}
                            >
                                <span
                                    className={b('button-text', {
                                        'with-remove': showRemoveItemIcon,
                                    })}
                                >
                                    {fieldName}
                                    {datasetId && <span className={b('info')}>{datasetText}</span>}
                                </span>
                                {showRemoveItemIcon && (
                                    <span
                                        onClick={() => handleRemoveAliasItemFromRow(index)}
                                        className={b('remove-item')}
                                    >
                                        <Icon data={Xmark} />
                                    </span>
                                )}
                            </Button>
                            {index !== array.length - 1 && (
                                <span className={b('separator')}>=</span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className={b('right')}>
                <Button
                    className={b('alias-icon-button', {active: isRowActive})}
                    view="flat"
                    onClick={() =>
                        onDetailClick({
                            indexRow,
                            aliasRow: row,
                        })
                    }
                    title={i18n('button_show-related-widgets')}
                >
                    <Icon data={Magnifier} />
                </Button>
                <Button
                    className={b('alias-icon-button', {active: isRowActive}, 'remove')}
                    view="flat"
                    onClick={handleRemoveAliasRow}
                    title={i18n('button_delete-alias')}
                    qa={DashCommonQa.AliasRemoveBtn}
                >
                    <Icon data={TrashBin} />
                </Button>
            </div>
        </div>
    );
};

type AliasesListProps = {
    aliases: RelationsData['byAliases'];
    widgetId: string;
    onAliasRowClick: (args: SelectParamArgs) => void;
    onDetailClick: (args: Pick<SelectParamArgs, 'indexRow' | 'aliasRow'>) => void;
    onRemoveClick: (args: {row: string[]; rowWithPartlyRemoved?: string[]}) => void;
    showDetailedData: boolean;
};

export const AliasesList = (props: AliasesListProps) => {
    const {onAliasRowClick, showDetailedData} = props;

    const [selectedAliasParamIndex, setSelectedAliasParamIndex] = React.useState<number | null>(
        null,
    );

    const {selectedAliasRowIndex} = React.useContext(AliasesContext);

    const handleSelectParam = React.useCallback(
        (args) => {
            const isClickedOnSelected =
                showDetailedData &&
                args.index === selectedAliasParamIndex &&
                args.indexRow === selectedAliasRowIndex;
            const paramIndex = isClickedOnSelected ? null : args.index;

            setSelectedAliasParamIndex(paramIndex);
            onAliasRowClick({...args, isClickedOnSelected});
        },
        [showDetailedData, selectedAliasParamIndex, selectedAliasRowIndex, onAliasRowClick],
    );

    React.useEffect(() => {
        setSelectedAliasParamIndex(selectedAliasRowIndex);
    }, [selectedAliasRowIndex]);

    return (
        <React.Fragment>
            {props.aliases.map((row: string[], indexRow: number) => (
                <AliasesListItem
                    key={`alias-${props.widgetId}-${indexRow}-${row.join('-')}`}
                    {...props}
                    row={row}
                    indexRow={indexRow}
                    onSelectParam={handleSelectParam}
                />
            ))}
        </React.Fragment>
    );
};
