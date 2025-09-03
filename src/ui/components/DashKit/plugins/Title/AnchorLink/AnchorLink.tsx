import React from 'react';

import block from 'bem-cn-lite';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import {DL} from 'ui/constants';

import '../Title.scss';

const b = block('dashkit-plugin-title-container');

interface AnchorLinkProps {
    to: string;
    show?: boolean;
}

export const AnchorLink = ({to, show}: AnchorLinkProps) => {
    const location = useLocation();
    const hash = `#${encodeURIComponent(to)}`;

    const link = {...location, hash};

    if (DL.IS_MOBILE || !show) {
        return null;
    }

    return (
        <Link className={b('anchor')} to={link}>
            #
        </Link>
    );
};
