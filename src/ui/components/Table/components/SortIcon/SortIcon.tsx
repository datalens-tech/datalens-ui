import React from 'react';

import {CaretDown, CaretUp} from '@gravity-ui/icons';

function getSortingIcon(sorting: 'asc' | 'desc' | false) {
    switch (sorting) {
        case 'desc':
            return CaretUp;
        case 'asc':
            return CaretDown;
        default:
            return null;
    }
}

export const SortIcon = (props: {sorting: 'asc' | 'desc' | false}) => {
    const Icon = getSortingIcon(props.sorting);

    if (Icon) {
        return (
            <React.Fragment>
                {' '}
                <Icon style={{verticalAlign: 'middle'}} />
            </React.Fragment>
        );
    }

    return null;
};
