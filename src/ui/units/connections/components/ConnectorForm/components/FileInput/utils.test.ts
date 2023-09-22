import {getBase64FromDataUrl} from './utils';

describe('connections/components/FileInput/utils', () => {
    test.each<[string | undefined, string]>([
        [undefined, ''],
        ['some_text', 'some_text'],
        ['data:application/json;base64,some_text', 'some_text'],
    ])('getBase64FromDataUrl (dataUrl: %p)', (dataUrl, expected) => {
        const result = getBase64FromDataUrl(dataUrl);
        expect(result).toEqual(expected);
    });
});
