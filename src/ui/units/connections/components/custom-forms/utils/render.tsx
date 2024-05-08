import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import type {FileSourceSchema} from 'shared/schema/types';

import DataTypeIcon from '../../../../../components/DataTypeIcon/DataTypeIcon';

import './render.scss';

const bIcon = block('conn-form-type-icon');

const isTitleMatchedByFilter = (title: string, filter: string) => {
    const lowerTitle = title.toLocaleLowerCase();
    const lowerFilter = filter.toLocaleLowerCase();

    return Boolean(lowerTitle.match(lowerFilter));
};

export const getColumnsWithTypeIcons = (args: {schema: FileSourceSchema; filter: string}) => {
    const {schema, filter} = args;

    return (schema || []).reduce(
        (acc, column, index) => {
            if (!column.title || isTitleMatchedByFilter(column.title, filter)) {
                acc.push({
                    name: column.name,
                    header: (
                        <React.Fragment>
                            <DataTypeIcon
                                className={bIcon()}
                                dataType={column.user_type}
                                width={14}
                            />
                            {column.title}
                        </React.Fragment>
                    ),
                    sortable: false,
                    render: ({row}) => row[index],
                });
            }

            return acc;
        },
        [] as Column<(string | number)[]>[],
    );
};
