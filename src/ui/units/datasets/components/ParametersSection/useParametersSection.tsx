import React from 'react';

import {useDispatch} from 'react-redux';
import type {DatasetField} from 'shared';

import {openDialogParameter} from '../../../../store/actions/dialog';
import {TAB_PARAMETERS} from '../../constants';
import {
    updateFieldWithValidation,
    updateFieldWithValidationByMultipleUpdates,
} from '../../store/actions/creators';
import type {
    FieldHeaderColumn,
    FieldListColumn,
    FieldRowControlSettings,
    MenuControlArgs,
    MenuControlItem,
} from '../DatasetTabFieldList/types';

import {
    getParameterRowColumn,
    getParameterRowMenuItems,
    getParametersTableHeaders,
} from './helpers';

type UseParametersSection = {
    columns: FieldListColumn[];
    headerColumns: FieldHeaderColumn[];
    controlSettings: MenuControlArgs;
    onItemClick: (field: DatasetField) => void;
};

export const useParametersSection = (): UseParametersSection => {
    const dispatch = useDispatch();

    const [headerColumns, setHeaderColumns] = React.useState<FieldHeaderColumn[]>([]);

    const columns = headerColumns
        .map((column) => {
            return getParameterRowColumn(column.columnType, column.width);
        })
        .filter((column): column is FieldListColumn => Boolean(column));

    const menuItems: MenuControlItem[] = getParameterRowMenuItems(dispatch);

    const controlSettings: FieldRowControlSettings = {
        type: 'menu',
        items: menuItems,
    };

    React.useEffect(() => {
        getParametersTableHeaders().then((headers) => {
            setHeaderColumns(headers);
        });
    }, []);

    const onItemClick = React.useCallback(
        (field: DatasetField) => {
            dispatch(
                openDialogParameter({
                    type: 'edit',
                    field,
                    onApply: (updatedField) => {
                        if (updatedField.guid === field.guid) {
                            dispatch(
                                updateFieldWithValidation(updatedField, {tab: TAB_PARAMETERS}),
                            );
                        } else {
                            // We send two field updates. Since title === is the guid for the parameter, you need to update both title and guid at the same time.
                            // Beck does not know how to do this, so we send 2 updates. First we update the guid, and with the second update we update the rest of the entire field.
                            const fieldWithNewGuid = {
                                ...updatedField,
                                guid: field.guid,
                                new_id: updatedField.guid,
                            };
                            dispatch(
                                updateFieldWithValidationByMultipleUpdates(
                                    [fieldWithNewGuid, updatedField],
                                    {tab: TAB_PARAMETERS},
                                ),
                            );
                        }
                    },
                }),
            );
        },
        [dispatch],
    );

    return {
        columns,
        headerColumns,
        controlSettings,
        onItemClick,
    };
};
