import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField, DatasetFieldAggregation, DatasetOptionFieldItem} from 'shared';

import {AggregationSelect} from '../components';
import {sortAggregationColumn} from '../utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetAggregationColumnArgs = {
    fields: DatasetOptionFieldItem[];
    onUpdate: (row: DatasetField, aggregation: DatasetFieldAggregation) => void;
    readonly: boolean;
};

export const getAggregationColumn = ({
    fields,
    onUpdate,
    readonly,
}: GetAggregationColumnArgs): Column<DatasetField> => ({
    name: 'aggregation',
    className: b('column', {'with-padding-right': true}, b('column-aggregation')),
    width: 160,
    sortable: true,
    sortAscending: sortAggregationColumn,
    header: <div className={b('header')}>{i18n('column_field-aggregation')}</div>,
    render: function AggregationColumnItem({value, index, row}) {
        const {aggregations = []} = fields.find(({guid}) => guid === row.guid) || {};

        return (
            <AggregationSelect
                key={index}
                field={row}
                aggregations={aggregations}
                selectedAggregation={value as string}
                onSelect={onUpdate}
                disabled={readonly}
            />
        );
    },
});
