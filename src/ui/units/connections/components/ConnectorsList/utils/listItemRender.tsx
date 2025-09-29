import React from 'react';

import type {RenderFn} from '../ListItem';

export const listItemRender: RenderFn = ({data, components}) => {
    const {ListItemWrapper, ListItemLink, ListItemTitle, ListItemIcon} = components;
    const {to, iconData, title} = data;
    return (
        <ListItemWrapper>
            <ListItemLink to={to}>
                <ListItemIcon iconData={iconData} />
                <ListItemTitle title={title} />
            </ListItemLink>
        </ListItemWrapper>
    );
};
