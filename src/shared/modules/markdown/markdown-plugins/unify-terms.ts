// eslint-disable-next-line import/no-extraneous-dependencies
import type {MarkdownIt, StateCore} from '@diplodoc/transform/lib/typings';

import {YfmAttributes, YfmTokenTypes} from '../../../constants';

type Tokens = StateCore['tokens'];
type Token = StateCore['tokens'][number];

const unifyAttributes = (attrs: [string, string][], attrName: YfmAttributes, prefix: string) => {
    for (const attr of attrs) {
        if (attr[0] === attrName && !attr[1].startsWith(`:${prefix}`)) {
            const value = attr[1];
            attr[1] = `:${prefix}_${value.slice(1)}`;
        }
    }

    return attrs;
};

const modifyTerm = (termToken: Token, prefix: string) => {
    if (termToken.attrs) {
        termToken.attrs = unifyAttributes(termToken.attrs, YfmAttributes.AriaDescribedby, prefix);
        termToken.attrs = unifyAttributes(termToken.attrs, YfmAttributes.TermKey, prefix);
    }

    return termToken;
};

const traverseLine = (tokens: Tokens, prefix: string) => {
    let i = 0;

    while (tokens[i]) {
        const currentToken = tokens[i];

        switch (currentToken.type) {
            case YfmTokenTypes.Inline: {
                if (currentToken.children) {
                    currentToken.children = traverseLine(currentToken.children, prefix);
                }

                break;
            }

            case YfmTokenTypes.TermOpen: {
                modifyTerm(currentToken, prefix);
                break;
            }

            case YfmTokenTypes.TemplateOpen: {
                const token = tokens[i];
                const next = tokens[i + 1];

                if (next && next.type === YfmTokenTypes.DefinitionOpen) {
                    if (token.attrs) {
                        token.attrs = unifyAttributes(token.attrs, YfmAttributes.Id, prefix);
                    }

                    if (next.attrs) {
                        next.attrs = unifyAttributes(next.attrs, YfmAttributes.Id, prefix);
                    }

                    i++;
                }
                break;
            }
        }

        i++;
    }

    return tokens;
};

export const unifyTermIds = (md: MarkdownIt, options: {prefix: string}) => {
    const prefix = options.prefix;

    try {
        md.core.ruler.after('termReplace', 'termLinkRandom', (state: StateCore) => {
            traverseLine(state.tokens, prefix);
        });
    } catch (_) {}
};
