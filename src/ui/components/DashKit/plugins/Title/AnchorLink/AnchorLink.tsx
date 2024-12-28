import React from 'react';

import type {PluginTitleSize} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import {DL} from 'ui/constants';

import '../Title.scss';

const b = block('dashkit-plugin-title-container');

interface AnchorLinkProps {
    size: PluginTitleSize | 'Custom';
    fontSize?: number;
    lineHeight?: number;
    to: string;
    show?: boolean;
    absolute?: boolean;
    top: number;
}

export const AnchorLink = ({
    size,
    fontSize,
    lineHeight,
    to,
    show,
    absolute,
    top,
}: AnchorLinkProps) => {
    const location = useLocation();
    const hash = `#${encodeURIComponent(to)}`;

    const link = {...location, hash};

    if (DL.IS_MOBILE || !show) {
        return null;
    }

    return (
        <Link
            className={b('anchor', {
                size: size === 'Custom' ? undefined : size,
                absolute,
            })}
            to={link}
            style={{top, fontSize, lineHeight}}
        >
            #
        </Link>
    );
};
