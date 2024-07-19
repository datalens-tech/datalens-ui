import {WRAPPED_HTML_KEY} from 'shared';

import {processHtmlFields} from '../ui-sandbox';

describe('processHtmlFields', () => {
    test('wrapped html in array', () => {
        const data = {
            categories: ['<b>1</b>', '2', {[WRAPPED_HTML_KEY]: {tag: 'b', content: '3'}}],
        };
        processHtmlFields(data, {allowHtml: false});

        expect(data).toEqual({categories: ['&lt;b&gt;1&lt;/b&gt;', '2', '<b>3</b>']});
    });
});
