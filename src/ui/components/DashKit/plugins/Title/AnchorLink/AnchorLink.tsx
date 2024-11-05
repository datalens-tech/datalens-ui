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
    top: number | null;
}

const AnchorLink = ({size, to, show, top}: AnchorLinkProps) => {
    const location = useLocation();
    const hash = `#${encodeURIComponent(to)}`;
    const isLinkVisible = location.hash === hash;

    const link = {...location, hash};

    if (DL.IS_MOBILE || !show) {
        return null;
    }

    return (
        <React.Fragment>
            <Link
                className={b('anchor', {
                    size,
                    visible: isLinkVisible,
                })}
                to={link}
                style={{top: `${top}px`}}
            >
                #
            </Link>
        </React.Fragment>
    );
};

export default AnchorLink;
