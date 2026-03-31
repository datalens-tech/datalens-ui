import {WRAPPED_HTML_KEY, type WrappedHTML} from '../../../../../../../shared';
import {isWrappedHTML} from '../../../../../../../shared/utils/ui-sandbox';

export function concatStringValues(...values: (string | WrappedHTML)[]) {
    if (values.some((val) => isWrappedHTML(val))) {
        return values.reduce<WrappedHTML>(
            (acc, val) => {
                if (isWrappedHTML(val)) {
                    acc[WRAPPED_HTML_KEY] += String(val[WRAPPED_HTML_KEY]);
                } else if (typeof val === 'string') {
                    acc[WRAPPED_HTML_KEY] += val;
                }

                return acc;
            },
            {[WRAPPED_HTML_KEY]: ''},
        );
    }

    return values.join('');
}
