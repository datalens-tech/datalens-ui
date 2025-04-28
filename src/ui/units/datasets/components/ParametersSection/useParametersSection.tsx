import React from 'react';

import {useDispatch} from 'react-redux';
import type {DatasetField} from 'shared';

import {TAB_PARAMETERS} from '../../constants';
import {openDialogParameterEdit} from '../../store/actions/creators';
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
            dispatch(openDialogParameterEdit({field, tab: TAB_PARAMETERS}));
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
