import React from 'react';

import {Link} from '@gravity-ui/uikit';

export const interpolateLinks = (link: string) => ({
    link(match: string) {
        return (
            <Link target="_blank" href={link}>
                {match}
            </Link>
        );
    },
});
