import React from 'react';

import type {PluginTitleProps} from '@gravity-ui/dashkit';
import {Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useHistory, useLocation} from 'react-router';

const b = block('dashkit-plugin-container');

interface DashAnchorLinkProps {
    size: PluginTitleProps['data']['size'];
    x: number;
    to: string;
}

const DashAnchorLink = ({size, x, to}: DashAnchorLinkProps) => {
    const location = useLocation();
    const history = useHistory();
    const hash = `#${encodeURIComponent(to)}`;
    const isLinkVisible = false || location.hash === hash;

    return (
        <Link
            onClick={(e) => {
                e.preventDefault();
                history.push({...location, hash});
            }}
            className={b('anchor', {
                size,
                absolute: x === 0,
                visible: isLinkVisible,
            })}
            href={hash}
        >
            #
        </Link>
    );
};

export default DashAnchorLink;
