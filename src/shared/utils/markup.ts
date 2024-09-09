import {WRAPPED_MARKUP_KEY} from '../constants';

export function wrapMarkupValue(value: unknown) {
    return {[WRAPPED_MARKUP_KEY]: value};
}

export type WrappedMarkup = ReturnType<typeof wrapMarkupValue>;
