import React from 'react';

import {Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {Interpolate} from '../Interpolate/Interpolate';

import './InterpolatedText.scss';

const b = block('interpolated-text');

type InterpolatedTextProps = {
    text: string;
    href?: string;
    br?: boolean;
    bold?: boolean;
};

const InterpolatedTextComponent = ({text, href, br, bold}: InterpolatedTextProps) => {
    const matches: Record<string, (match: string) => React.ReactNode> = {};

    if (href) {
        matches.link = (match) => {
            return (
                <Link href={href} target="_blank">
                    {match}
                </Link>
            );
        };
    }

    if (br) {
        matches.br = () => {
            return <br />;
        };
    }

    if (bold) {
        matches.b = (match) => {
            return <span className={b('text-selected')}>{match}</span>;
        };
    }

    return <Interpolate text={text} matches={matches} />;
};

export const InterpolatedText = React.memo(InterpolatedTextComponent);
