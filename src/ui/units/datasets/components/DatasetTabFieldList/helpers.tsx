import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import type {DatasetField} from 'shared';

import {TitleColumn} from './components/TitleColumn/TitleColumn';
import {TypeColumn} from './components/TypeColumn/TypeColumn';
import {ValidationColumn} from './components/ValidationColumn/ValidationColumn';
import {ValueColumn} from './components/ValueColumn/ValueColumn';
import type {FieldColumn, FieldListColumn} from './types';

export const getFieldRowColumns = (
    columns: FieldListColumn[],
    item: ListItemData<DatasetField>,
    rowKey: string,
    rowIndex: number,
): Array<FieldColumn | null> => {
    return columns.map((column, index) => {
        const key = `${rowKey}_${index}`;
        switch (column.columnType) {
            case 'title': {
                const {title, type} = column.getTitleProps(item);
                return {
                    width: column.width,
                    node: <TitleColumn key={key} title={title} type={type} />,
                };
            }
            case 'value': {
                const {text} = column.getValueProps(item);
                return {
                    width: column.width,
                    node: <ValueColumn key={key} text={text} />,
                };
            }
            case 'type': {
                const {type, datasetFieldType} = column.getTypeProps(item);
                return {
                    qa: `${type}-row-${rowIndex}`,
                    width: column.width,
                    node: <TypeColumn type={type} datasetFieldType={datasetFieldType} />,
                };
            }
            case 'custom': {
                const {node, width} = column.getCustomNodeProps(item);
                return {
                    node,
                    width,
                };
            }
            case 'text': {
                const {width, value} = column.getTextProps(item);
                return {
                    text: value,
                    width,
                };
            }
            case 'validation': {
                const {templateEnabled} = column.getValidationProps(item);
                return {
                    node: <ValidationColumn templateEnabled={templateEnabled} />,
                };
            }
            default:
                return null;
        }
    });
};
