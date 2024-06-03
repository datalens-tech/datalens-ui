import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import type {EntryScope} from 'shared';

import {changeFilters} from '../../store/actions';
import {selectWorkbook, selectWorkbookFilters} from '../../store/selectors';

import {EmptyWorkbook} from './EmptyWorkbook';

export const EmptyWorkbookContainer = React.memo(({scope}: {scope?: EntryScope}) => {
    const dispatch = useDispatch();

    const workbook = useSelector(selectWorkbook);
    const filters = useSelector(selectWorkbookFilters);

    if (!workbook) {
        return null;
    }

    return (
        <EmptyWorkbook
            workbook={workbook}
            filters={filters}
            scope={scope}
            onChangeFilters={(data) => dispatch(changeFilters(data))}
        />
    );
});

EmptyWorkbookContainer.displayName = 'EmptyWorkbookContainer';
