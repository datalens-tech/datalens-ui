import React from 'react';

// import {RECCOMMENDED_LINE_HEIGHT_MULTIPLIER, TITLE_DEFAULT_SIZES} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import {DL} from 'ui/constants';

import '../Title.scss';

const b = block('dashkit-plugin-title-container');

interface AnchorLinkProps {
    to: string;
    show?: boolean;
    absolute?: boolean;
}

export const AnchorLink = ({to, show, absolute}: AnchorLinkProps) => {
    const location = useLocation();
    const hash = `#${encodeURIComponent(to)}`;

    const link = {...location, hash};

    if (DL.IS_MOBILE || !show) {
        return null;
    }

    return (
        <Link className={b('anchor', {absolute})} to={link}>
            #
        </Link>
    );
};
