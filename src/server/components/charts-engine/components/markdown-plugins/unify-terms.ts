import type {MarkdownIt, StateCore} from '@diplodoc/transform/lib/typings';
import type StateBlock from 'markdown-it/lib/rules_block/state_block';

import {YfmAttributes, YfmTokenTypes} from '../../../../../shared';

type Tokens = StateCore['tokens'];
type Token = StateCore['tokens'][number];

const unifyAttributes = (attrs: [string, string][], attrName: YfmAttributes, prefix: string) => {
    for (const attr of attrs) {
        if (attr[0] === attrName) {
            const value = attr[1];
            attr[1] = `:${prefix}_${value.slice(1)}`;
        }
    }

    return attrs;
};

const termDefinitionsRandom = (prefix: string) => (state: StateBlock) => {
    const tokens = state.tokens;
    let i = 0;

    while (tokens[i]) {
        const token = tokens[i];

        if (token.type === YfmTokenTypes.TemplateOpen) {
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
        }

        i++;
    }

    return false;
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

        if (currentToken.type === YfmTokenTypes.Inline && currentToken.children) {
            currentToken.children = traverseLine(currentToken.children, prefix);
        } else if (currentToken.type === YfmTokenTypes.TermOpen) {
            modifyTerm(currentToken, prefix);
        }

        i++;
    }

    return tokens;
};

export const unifyTermIds = (md: MarkdownIt, options: {prefix: string}) => {
    const prefix = options.prefix;

    try {
        md.block.ruler.after(
            'termDefinitions',
            'termDefinitionsRandom',
            termDefinitionsRandom(prefix),
        );
        md.core.ruler.after('termReplace', 'termLinkRandom', (state: StateCore) => {
            traverseLine(state.tokens, prefix);
        });
    } catch (_) {}
};
