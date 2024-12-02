import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {DatasetsListData} from '../../../../types';

import {getFieldNameByGuid} from './AliasesList';

const b = block('dialog-aliases-list');
const i18n = I18n.keyset('component.dialog-relations.view');

type AliasesInvalidListProps = {
    aliases: string[][];
    invalidAliases: string[] | null;
    datasets: DatasetsListData | null;
    onClose?: () => void;
    onClear?: () => void;
};

type AliasesInvalidListItemProps = {
    row: string[];
    invalidAliases: AliasesInvalidListProps['invalidAliases'];
    datasets: AliasesInvalidListProps['datasets'];
};

const AliasesInvalidListItem = (props: AliasesInvalidListItemProps) => {
    const {row, invalidAliases, datasets} = props;

    return (
        <div className={b('row')}>
            <div className={b('left')}>
                {row.map((aliasItem, index, array) => {
                    const {datasetId, field, datasetName} = getFieldNameByGuid(datasets, aliasItem);
                    const datasetText = datasetId
                        ? ` (${i18n('label_dataset')}: ${datasetName ? datasetName : datasetId})`
                        : '';
                    const fieldName = field?.title || aliasItem;

                    const isInvalidItem = invalidAliases?.includes(aliasItem);
                    const buttonView = isInvalidItem ? 'outlined-danger' : 'outlined';

                    return (
                        <React.Fragment key={`alias-row-invalid-${aliasItem}`}>
                            <Button
                                className={b('alias-button', 'not-active')}
                                view={buttonView}
                                size="m"
                            >
                                {fieldName}
                                {datasetId && <span className={b('info')}>{datasetText}</span>}
                            </Button>
                            {index !== array.length - 1 && (
                                <span className={b('separator')}>=</span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export const AliasesInvalidList = (props: AliasesInvalidListProps) => {
    const {aliases, invalidAliases, onClose, onClear} = props;

    const aliasesWithInvalidList = aliases.filter((itemsRow) => {
        return Boolean(itemsRow.filter((item) => invalidAliases?.includes(item)).length);
    });

    const showControls = Boolean(onClose) && Boolean(onClear);
    const handleOnClear = React.useCallback(() => {
        if (onClose && onClear) {
            onClear();
            onClose();
        }
    }, [onClear, onClose]);

    return (
        <div className={b('invalid-list')}>
            <div className={b('invalid-list-items')}>
                {aliasesWithInvalidList.map((row: string[], indexRow: number) => (
                    <AliasesInvalidListItem
                        key={`alias-invalid-${indexRow}-${row.join('-')}`}
                        {...props}
                        row={row}
                        invalidAliases={invalidAliases}
                    />
                ))}
            </div>
            {showControls ? (
                <div className={b('controls')}>
                    <Button
                        className={b('alias-clear-button')}
                        view="flat"
                        onClick={onClose}
                        title={i18n('button_cancel')}
                    >
                        {i18n('button_cancel')}
                    </Button>
                    <Button
                        className={b('alias-clear-button')}
                        view="outlined"
                        onClick={handleOnClear}
                        title={i18n('button_clear-alias')}
                    >
                        {i18n('button_clear-alias')}
                    </Button>
                </div>
            ) : null}
        </div>
    );
};
