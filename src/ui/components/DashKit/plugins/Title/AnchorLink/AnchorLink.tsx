import React from 'react';

import {RECCOMMENDED_LINE_HEIGHT_MULTIPLIER} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import type {DashTitleSize} from 'shared';
import {DL} from 'ui/constants';

import '../Title.scss';

const b = block('dashkit-plugin-title-container');

interface AnchorLinkProps {
    size: DashTitleSize;
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

    const fontStyle =
        typeof size === 'object' && size.fontSize
            ? {
                  fontSize: size.fontSize + 'px',
                  lineHeight: RECCOMMENDED_LINE_HEIGHT_MULTIPLIER,
              }
            : {};

    return (
        <Link
            className={b('anchor', {
                size: typeof size === 'string' ? size : false,
                absolute,
            })}
            to={link}
            style={{top, ...fontStyle}}
        >
            #
        </Link>
    );
};
