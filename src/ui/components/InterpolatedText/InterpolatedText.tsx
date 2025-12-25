import React from 'react';

import {Link} from '@gravity-ui/uikit';

import {Interpolate} from '../Interpolate/Interpolate';

type InterpolatedTextProps = {
    text: string;
    href?: string | string[];
    br?: boolean;
    b?: boolean;
    code?: boolean;
    // may be useful if you need to wait for the documentation for the text.
    disableLink?: boolean;
};

const InterpolatedTextComponent = ({
    text,
    href,
    br,
    b,
    code,
    disableLink,
}: InterpolatedTextProps) => {
    const matches: Record<string, (match: string, index?: number) => React.ReactNode> = {};

    if (disableLink) {
        matches.link = (match) => {
            return match;
        };
    }

    if (href) {
        matches.link = (match, index) => {
            if (Array.isArray(href)) {
                return (
                    <Link href={href[index ?? 0]} target="_blank">
                        {match}
                    </Link>
                );
            }

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

    if (b) {
        matches.b = (match) => {
            return <b>{match}</b>;
        };
    }

    if (code) {
        matches.code = (match) => {
            return <code>{match}</code>;
        };
    }

    return <Interpolate text={text} matches={matches} />;
};

export const InterpolatedText = React.memo(InterpolatedTextComponent);
