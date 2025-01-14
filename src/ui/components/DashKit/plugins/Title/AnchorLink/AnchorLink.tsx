import React from 'react';

import {RECCOMMENDED_LINE_HEIGHT_MULTIPLIER, TITLE_DEFAULT_SIZES} from '@gravity-ui/dashkit';
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

    let fontStyle: React.CSSProperties = {};
    if (typeof size === 'object' && size.fontSize) {
        fontStyle = {
            fontSize: size.fontSize + 'px',
            lineHeight: RECCOMMENDED_LINE_HEIGHT_MULTIPLIER,
        };
    } else if (typeof size === 'string') {
        fontStyle = TITLE_DEFAULT_SIZES[size];
    }

    return (
        <Link
            className={b('anchor', {
                absolute,
            })}
            to={link}
            style={{top, ...fontStyle}}
        >
            #
        </Link>
    );
};
