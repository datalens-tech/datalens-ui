import React from 'react';

import block from 'bem-cn-lite';
import type {FileSourcePreview, FileSourceSchema} from 'shared/schema/types';
import type {TableCellsRow} from 'shared/types/chartkit/table';

import DataTypeIcon from '../../../../../components/DataTypeIcon/DataTypeIcon';
import type {FileSourcePreviewTableColumn} from '../hooks/useFileSourceTableWidgetData';

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

const getCellSCss = (isFirst?: boolean): React.CSSProperties => {
    return {
        ...BASE_CELL_CSS,
        ...(isFirst ? FIRST_CELL_CSS : null),
    };
};

const COLUMN_CONTENT_CSS = {
    display: 'inline-flex',
    alignItems: 'center',
};

const COLUMN_INNER_CONTENT_CSS = {
    display: 'inline-flex',
    alignItems: 'center',
};

export const getFileSourcePreviewTableColumnCss = (
    isFirst?: boolean,
): Pick<FileSourcePreviewTableColumn, 'css' | 'contentCss' | 'innerContentCss'> => {
    return {
        css: getCellSCss(isFirst),
        contentCss: COLUMN_CONTENT_CSS,
        innerContentCss: COLUMN_INNER_CONTENT_CSS,
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
                name: (
                    <>
                        <DataTypeIcon className={bIcon()} dataType={column.user_type} width={14} />
                        {column.title}
                    </>
                ),
                sortable: false,
                ...getFileSourcePreviewTableColumnCss(acc.length === 0),
                custom: {originalIndex: index},
            });
        }

        return acc;
    }, [] as FileSourcePreviewTableColumn[]);
};

const ROW_CONTENT_CSS = {
    alignItems: 'center',
};

export const getFileSourcePreviewTableRows = ({
    columns,
    fileSourcePreview,
}: {
    fileSourcePreview: FileSourcePreview;
    columns: FileSourcePreviewTableColumn[];
}): TableCellsRow[] => {
    return fileSourcePreview.map((cells) => {
        return {
            cells: columns.map((column, index) => {
                const {
                    id,
                    custom: {originalIndex},
                } = column;
                const value = cells[originalIndex] || '';

                return {
                    fieldId: id,
                    value,
                    css: getCellSCss(index === 0),
                    contentCss: ROW_CONTENT_CSS,
                };
            }),
        };
    });
};
