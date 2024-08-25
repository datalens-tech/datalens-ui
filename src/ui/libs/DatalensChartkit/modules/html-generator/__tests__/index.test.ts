import {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

import {generateHtml} from '../index';

type GenerateHtmlArgs = Parameters<typeof generateHtml>;

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

    test('should preserve incorrect values of style properties', () => {
        expect(
            generateHtml({
                tag: 'div',
                content: '123',
                style: {
                    'font-weight': 'bold',
                    color: '{series.color}',
                },
            }),
        ).toEqual('<div style="font-weight: bold; color: {series.color};">123</div>');
    });

    test('should escape incorrect values of style properties', () => {
        expect(
            generateHtml({
                tag: 'div',
                content: '123',
                style: {
                    color: '<a>123</a>',
                },
            }),
        ).toEqual('<div style="color: &amp;lt;a&amp;gt;123&amp;lt;/a&amp;gt;;">123</div>');
    });

    // @ts-expect-error
    test.each<GenerateHtmlArgs>([
        [{tag: 'div', theme: {}}],
        [{tag: 'div', theme: {dark: null, light: null}}],
        [{tag: 'div', theme: {dark: 42, light: 42}}],
        [{tag: 'div', theme: {dark: {}}}],
        [{tag: 'div', theme: {light: {}}}],
        [{tag: 'div', theme: {dark: {'--my-var': '#fff'}, light: {}}}],
        [{tag: 'div', theme: {dark: {'--ce-theme': null}, light: {}}}],
        [{tag: 'div', theme: {dark: {'--ce-theme': 42}, light: {}}}],
        [{tag: 'div', theme: {dark: {}, light: {'--my-var': '#fff'}}}],
        [{tag: 'div', theme: {dark: {}, light: {'--ce-theme': null}}}],
        [{tag: 'div', theme: {dark: {}, light: {'--ce-theme': 42}}}],
    ])('should throw an error in case of incorrect theme property (args: %j)', (item) => {
        expect(() => generateHtml(item)).toThrowError(ChartKitCustomError);
    });
});
