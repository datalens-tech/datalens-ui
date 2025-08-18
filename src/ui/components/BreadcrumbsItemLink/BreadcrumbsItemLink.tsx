import React from 'react';

import type {BreadcrumbsItemProps} from '@gravity-ui/uikit';
import {BreadcrumbsItem} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';

interface BreadcrumbsItemLinkProps extends BreadcrumbsItemProps {
    to?: string;
}

export const BreadcrumbsItemLink = ({to, ...rest}: BreadcrumbsItemLinkProps) => {
    const history = useHistory();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (to) {
            history.push(to);
        }
    };

    return <BreadcrumbsItem {...rest} onClick={handleClick} />;
};
