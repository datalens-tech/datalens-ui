import {extractEntryId} from '../';

test('extractEntryId returns null', () => {
    const entryId = 'phz6hrfoms3oo';
    const values = [
        '',
        '!hz6hr-oms3o?',
        '/',

        `/marketplace/${entryId}`,
        `/${entryId}?r=2`,
        `/${entryId}&d=2`,
        `/nav/${entryId}#hash`,
        `/market/place/${entryId}`,

        `/datasets/${entryId}text`,
    ];

    expect(values.every((value) => extractEntryId(value) === null)).toEqual(true);
});

test("extractEntryId matches entrie's id", () => {
    const entryId = 'phz6hrfoms3oo';
    const values = [
        `${entryId}`,
        `${entryId}/`,
        `/${entryId}`,
        `/${entryId}/`,
        `/${entryId}-lorem-ipsum-kpi`,
        `/datasets/${entryId}-`,
        `/wizard/${entryId}-/`,
        `/${entryId}-bla-bla-`,

        `/navigation/${entryId}`,
        `/datasets/${entryId}/`,
        `/wizard/${entryId}-grow-scale/`,
        `/preview/${entryId}/`,
        `editor/${entryId}`,
        `/preview/${entryId}-deprecated`,
    ];

    expect(values.every((value) => extractEntryId(value) === entryId)).toEqual(true);
});
