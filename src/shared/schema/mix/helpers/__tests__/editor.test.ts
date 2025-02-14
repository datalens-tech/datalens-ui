import {getEntryLinks, validateData} from '../editor';

describe('shared/schema/mix/helpers/validateData', () => {
    test.each([
        {
            name: 'valid meta with links',
            data: {
                meta: JSON.stringify({
                    links: {a: 'id1', b: 'id2'},
                }),
            },
        },
        {
            name: 'empty data',
            data: null,
        },
        {
            name: 'empty meta object',
            data: {
                meta: JSON.stringify({}),
            },
        },
    ])('should validate successfully: $name', ({data}) => {
        expect(() => validateData(data)).not.toThrow();
    });

    test.each([
        {
            name: 'invalid JSON in meta',
            data: {meta: '{invalid json'},
            error: 'Meta must be a valid JSON',
        },
        {
            name: 'meta is not an object',
            data: {meta: JSON.stringify(['array'])},
            error: 'Meta must be an object',
        },
        {
            name: 'links is not an object',
            data: {meta: JSON.stringify({links: 'string'})},
            error: '"links" property must be an object',
        },
        {
            name: 'unknown meta tab keys',
            data: {meta: JSON.stringify({unknownKey: 'value'})},
            error: 'Unknown keys in tab "meta": unknownKey',
        },
        {
            name: 'links contain non-string values',
            data: {
                meta: JSON.stringify({
                    links: {
                        validLink: 'id1',
                        number: 42,
                        boolean: true,
                        object: {id: 'test'},
                    },
                }),
            },
            error: 'Next keys in "linlk" property has unsupported types: number, boolean, object. They must have a "string" type',
        },
    ])('should throw error: $name', ({data, error}) => {
        expect(() => validateData(data)).toThrow(error);
    });
});

describe('shared/schema/mix/helpers/getEntryLinks', () => {
    test.each([
        {
            name: 'returns empty object when no meta',
            args: {
                data: {},
            },
            expected: {},
        },
        {
            name: 'returns empty object when meta is empty',
            args: {
                data: {meta: '{}'},
            },
            expected: {},
        },
        {
            name: 'returns flattened links from meta',
            args: {
                data: {
                    meta: JSON.stringify({
                        links: {
                            a: 'id1',
                            b: 'id2',
                        },
                    }),
                },
            },
            expected: {
                id1: 'id1',
                id2: 'id2',
            },
        },
    ])('$name', ({args, expected}) => {
        expect(getEntryLinks(args)).toEqual(expected);
    });
});
