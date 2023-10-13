import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DatasetsFieldsListData} from 'ui/components/DashKit/plugins/types';
import {AliasesContext} from 'ui/units/dash/containers/Dialogs/DialogRelations/hooks/useRelations';
import {
    DatasetsListData,
    RelationsData,
} from 'ui/units/dash/containers/Dialogs/DialogRelations/types';

import MagnifierIcon from '@gravity-ui/icons/svgs/magnifier.svg';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';

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

const getFieldNameByGuid = (datasets: DatasetsListData | null, aliasItem: string) => {
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
    const {datasets, selectedAliasRowIndex, selectedParam} = React.useContext(AliasesContext);

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
        [onRemoveClick],
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
                    const buttonView = isAliasItemSelected ? 'outlined-info' : 'outlined';
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
                            >
                                {fieldName}
                                {datasetId && <span className={b('info')}>{datasetText}</span>}
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
                    <Icon data={MagnifierIcon} />
                </Button>
                <Button
                    className={b('alias-icon-button', {active: isRowActive}, 'remove')}
                    view="flat"
                    onClick={handleRemoveAliasRow}
                    title={i18n('button_delete-alias')}
                >
                    <Icon data={TrashBinIcon} />
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
        [onAliasRowClick, selectedAliasRowIndex, selectedAliasParamIndex],
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
