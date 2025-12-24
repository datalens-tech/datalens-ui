import React from 'react';

import {Function} from '@gravity-ui/icons';
import type {Column} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField, DatasetSourceAvatar} from 'shared';

import {FORMULA_CALC_MODE} from '../constants';
import {getFieldSourceTitle, sortSourceColumn} from '../utils';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type GetSourceColumnArgs = {
    width: string;
    avatars?: DatasetSourceAvatar[];
    openDialogFieldEditor: (row: DatasetField) => void;
    readonly: boolean;
};

export const getSourceColumn = (args: GetSourceColumnArgs): Column<DatasetField> => {
    const {width, avatars, openDialogFieldEditor, readonly} = args;

    return {
        name: 'formula',
        className: b('column'),
        align: DataTable.LEFT,
        // TODO: the type will be repaired after - CHARTS-5343
        // @ts-ignore
        width,
        sortable: true,
        sortAscending: (row1, row2) => sortSourceColumn(row1, row2, avatars),
        header: (
            <div className={b('header', b('header-column-source'))}>{i18n('column_source')}</div>
        ),
        render: function SourceColumnItem({index, row}) {
            const isFormulaField = row.calc_mode === FORMULA_CALC_MODE;

            return (
                <Button
                    key={`source-${index}`}
                    className={b('btn-source', {formula: isFormulaField})}
                    view="flat"
                    title={i18n('button_open-field-editor')}
                    width="max"
                    disabled={readonly}
                    onClick={() => openDialogFieldEditor(row)}
                >
                    {isFormulaField ? (
                        <Icon className={b('formula')} data={Function} size={20} />
                    ) : (
                        getFieldSourceTitle(row, avatars)
                    )}
                </Button>
            );
        },
    };
};
