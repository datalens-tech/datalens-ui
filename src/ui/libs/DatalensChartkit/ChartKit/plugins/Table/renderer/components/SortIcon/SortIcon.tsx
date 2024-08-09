import React from 'react';

import {CaretDown, CaretUp} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

function getSortingIcon(sorting: 'asc' | 'desc' | false) {
    switch (sorting) {
        case 'desc':
            return CaretDown;
        case 'asc':
            return CaretUp;
        default:
            return null;
    }
}

export const SortIcon = (props: {sorting: 'asc' | 'desc' | false; className?: string}) => {
    const sortingIcon = getSortingIcon(props.sorting);

    if (sortingIcon) {
        return (
            <React.Fragment>
                {' '}
                <Icon className={props.className} data={sortingIcon} />
            </React.Fragment>
        );
    }

    return null;
};
