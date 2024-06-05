import {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

import {generateHtml} from '../index';

describe('generateHtml', () => {
    test('html generation using valid tags', () => {
        const actual = generateHtml({
            tag: 'div',
            content: '123',
            style: {
                color: 'red',
            },
            attributes: {
                tabindex: 1,
            },
        });

        expect(actual).toEqual('<div style="color: red;" tabindex="1">123</div>');
    });

    test('using invalid tags should cause an error', () => {
        expect(() =>
            generateHtml({
                tag: 'div1',
            }),
        ).toThrowError(ChartKitCustomError);
    });

    test('using invalid attributes should cause an error', () => {
        expect(() =>
            generateHtml({
                tag: 'div',
                attributes: {
                    onclick: 'something',
                },
            }),
        ).toThrowError(ChartKitCustomError);
    });

    test('link href attribute', () => {
        // valid link
        expect(
            generateHtml({
                tag: 'a',
                content: 'link',
                attributes: {
                    href: 'https://ya.ru',
                },
            }),
        ).toEqual('<a href="https://ya.ru">link</a>');

        // invalid link
        expect(() =>
            generateHtml({
                tag: 'a',
                content: 'link',
                attributes: {
                    // eslint-disable-next-line no-script-url
                    href: 'javascript: alert(1)',
                },
            }),
        ).toThrowError(ChartKitCustomError);
    });
});
