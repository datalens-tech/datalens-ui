import React from 'react';

import block from 'bem-cn-lite';
import type {FileSourcePreview, FileSourceSchema} from 'shared/schema/types';
import type {TableCellsRow, TableHead} from 'shared/types/chartkit/table';

import DataTypeIcon from '../../../../../components/DataTypeIcon/DataTypeIcon';

import './render.scss';

const bIcon = block('conn-form-type-icon');

const isTitleMatchedByFilter = (title: string, filter: string) => {
    const lowerTitle = title.toLocaleLowerCase();
    const lowerFilter = filter.toLocaleLowerCase();

    return Boolean(lowerTitle.match(lowerFilter));
};

const BASE_CELL_CSS = {
    height: '38px',
    borderBottom: '1px solid var(--g-color-line-generic)',
};

const FIRST_CELL_CSS = {
    paddingLeft: '20px',
};

export const getFileSourcePreviewTableCellCss = (isFirst?: boolean): React.CSSProperties => {
    return {
        ...BASE_CELL_CSS,
        ...(isFirst ? FIRST_CELL_CSS : null),
    };
};

export const getFileSourcePreviewTableColumns = (args: {
    schema: FileSourceSchema;
    filter: string;
}) => {
    const {schema, filter} = args;

    return (schema || []).reduce((acc, column, index) => {
        if (!column.title || isTitleMatchedByFilter(column.title, filter)) {
            acc.push({
                id: column.name,
                type: 'text',
                name: column.name,
                formattedName: (
                    <>
                        <DataTypeIcon className={bIcon()} dataType={column.user_type} width={14} />
                        {column.title}
                    </>
                ),
                sortable: false,
                css: getFileSourcePreviewTableCellCss(acc.length === 0),
                custom: {originalIndex: index},
                verticalAlignment: 'center',
            });
        }

        return acc;
    }, [] as TableHead[]);
};

export const getFileSourcePreviewTableRows = ({
    columns,
    fileSourcePreview,
}: {
    fileSourcePreview: FileSourcePreview;
    columns: TableHead[];
}): TableCellsRow[] => {
    return fileSourcePreview.map((cells) => {
        return {
            cells: columns.map((column, index) => {
                const {id, custom} = column;
                const originalIndex = custom?.originalIndex;
                const value = cells[originalIndex] || '';

                return {
                    fieldId: id,
                    value,
                    css: getFileSourcePreviewTableCellCss(index === 0),
                    verticalAlignment: 'center',
                };
            }),
        };
    });
};
