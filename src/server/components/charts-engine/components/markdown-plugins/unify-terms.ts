import type {MarkdownIt, StateCore} from '@diplodoc/transform/lib/typings';
import type StateBlock from 'markdown-it/lib/rules_block/state_block';

type Token = StateCore['tokens'][number];

const unifyAttributes = (attrs: [string, string][], attrName: string, prefix: string) => {
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

        if (token.type === 'template_open') {
            const next = tokens[i + 1];

            if (next && next.type === 'dfn_open') {
                if (token.attrs) {
                    token.attrs = unifyAttributes(token.attrs, 'id', prefix);
                }

                if (next.attrs) {
                    next.attrs = unifyAttributes(next.attrs, 'id', prefix);
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
        termToken.attrs = unifyAttributes(termToken.attrs, 'aria-describedby', prefix);
        termToken.attrs = unifyAttributes(termToken.attrs, 'term-key', prefix);
    }

    return termToken;
};

const traverseLine = (tokens: StateCore['tokens'], prefix: string) => {
    let i = 0;

    while (tokens[i]) {
        const currentToken = tokens[i];

        if (currentToken.type === 'inline' && currentToken.children) {
            currentToken.children = traverseLine(currentToken.children, prefix);
        } else if (currentToken.type === 'term_open') {
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
