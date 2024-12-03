import React from 'react';

import type {PluginTitleProps} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import {DL} from 'ui/constants';

import '../Title.scss';

const b = block('dashkit-plugin-title-container');

interface AnchorLinkProps {
    size: PluginTitleProps['data']['size'];
    to: string;
    show?: boolean;
    absolute?: boolean;
    top: number;
}

export const AnchorLink = ({size, to, show, absolute, top}: AnchorLinkProps) => {
    const location = useLocation();
    const hash = `#${encodeURIComponent(to)}`;

    const link = {...location, hash};

    if (DL.IS_MOBILE || !show) {
        return null;
    }

    return (
        <Link
            className={b('anchor', {
                size,
                absolute,
            })}
            to={link}
            style={{top}}
        >
            #
        </Link>
    );
};
