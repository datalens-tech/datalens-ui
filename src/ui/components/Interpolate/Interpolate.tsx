import React from 'react';

export interface InterpolateProps {
    text: string;
    matches: {
        [key: string]: (match: string) => React.ReactNode;
    };
}

export const Interpolate: React.FC<InterpolateProps> = ({text, matches}) => {
    const children = React.useMemo(() => {
        const keys = Object.keys(matches).join('|');
        const reg = new RegExp(`<(${keys})>(.*?)</\\1>`);

        // We divide the text into triples (split with capture of 2 groups)
        // for example, from the text "this is a <wrap>link</wrap>!" get result like:
        // ["this", "wrap", "link", " !"]
        const splitted = text.split(reg);

        const nodes = splitted.reduce((acc: React.ReactNode[], part, index) => {
            let node: React.ReactNode;
            if (index % 3 === 2) {
                return acc;
            } else if (index % 3 === 0) {
                if (part.length === 0) {
                    return acc;
                }
                node = part;
            } else {
                const match = splitted[index + 1];
                node = matches[part](match);
            }
            acc.push(node);
            return acc;
        }, []);

        return nodes;
    }, [text, matches]);

    return (
        <React.Fragment>
            {children.map((child, key) => (
                <React.Fragment key={key}>{child}</React.Fragment>
            ))}
        </React.Fragment>
    );
};
