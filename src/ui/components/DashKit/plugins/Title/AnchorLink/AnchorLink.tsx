import React from 'react';

import type {PluginTitleProps} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import {DL} from 'ui/constants';

import './AnchorLink.scss';

const b = block('dashkit-title-anchor-link');

interface AnchorLinkProps {
    size: PluginTitleProps['data']['size'];
    x: number;
    to: string;
}

const AnchorLink = ({size, x, to}: AnchorLinkProps) => {
    const location = useLocation();
    const hash = `#${encodeURIComponent(to)}`;
    const isLinkVisible = location.hash === hash;

    const link = {...location, hash};

    if (DL.IS_MOBILE) {
        return null;
    }

    return (
        <React.Fragment>
            <Link
                className={b({
                    size,
                    absolute: x === 0,
                    visible: isLinkVisible,
                })}
                to={link}
            >
                #
            </Link>
        </React.Fragment>
    );
};

export default AnchorLink;
