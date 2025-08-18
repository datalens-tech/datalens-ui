import React from 'react';

import type {BreadcrumbsItemProps} from '@gravity-ui/uikit';
import {BreadcrumbsItem} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';

export const BreadcrumbsItemLink = ({
    to,
    ...rest
}: BreadcrumbsItemProps & React.RefAttributes<HTMLAnchorElement> & {to?: string}) => {
    const history = useHistory();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (to) {
            history.push(to);
        }
    };

    return <BreadcrumbsItem {...rest} onClick={handleClick} />;
};
