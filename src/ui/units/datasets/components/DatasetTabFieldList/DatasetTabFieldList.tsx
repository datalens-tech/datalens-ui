import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import {List, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField} from 'shared';

import {FieldRow} from './components/FieldRow/FieldRow';
import {getFieldRowColumns} from './helpers';
import type {FieldColumn, FieldListColumn, FieldRowControlSettings} from './types';

import './DatasetTabFieldList.scss';

const b = block('dataset-tab-field-list');

type DatasetTabFieldListProps = {
    onItemClick?: (item: DatasetField) => void;
    fields: DatasetField[];
    headerColumns: FieldColumn[];
    columns: FieldListColumn[];
    isLoading: boolean;
    controlSettings?: FieldRowControlSettings;
    checkIsRowValid?: (item: DatasetField) => boolean;
    readonly: boolean;
};

export const DatasetTabFieldList: React.FC<DatasetTabFieldListProps> = (
    props: DatasetTabFieldListProps,
) => {
    const {fields, headerColumns, columns, isLoading, controlSettings, checkIsRowValid, readonly} =
        props;

    const listItems = React.useMemo(() => {
        if (readonly) {
            return fields.map((item) => ({...item, disabled: true}));
        }
        return fields;
    }, [readonly, fields]);

    const renderItem = React.useCallback(
        (item: ListItemData<DatasetField>, _isActive: boolean, rowIndex: number) => {
            const rowKey = `${item.title}_${item.guid}_${rowIndex}`;

            const isValid = checkIsRowValid ? checkIsRowValid(item) : true;

            const rawColumns = getFieldRowColumns(columns, item, rowKey, rowIndex);

            const preparedColumns = rawColumns.filter((col): col is FieldColumn => Boolean(col));

            return (
                <FieldRow
                    readonly={readonly}
                    isValid={isValid}
                    columns={preparedColumns}
                    field={item}
                    controlSettings={controlSettings}
                />
            );
        },
        [checkIsRowValid, columns, controlSettings],
    );

    return (
        <div className={b({progress: isLoading})}>
            {Boolean(fields.length) && (
                <FieldRow isHeader={true} columns={headerColumns} readonly={readonly} />
            )}
            <List
                itemClassName={b('list-item', {readonly})}
                items={listItems}
                renderItem={renderItem}
                onItemClick={props.onItemClick}
                filterable={false}
                virtualized={false}
            />
            {isLoading && <Loader className={b('loader')} />}
        </div>
    );
};
