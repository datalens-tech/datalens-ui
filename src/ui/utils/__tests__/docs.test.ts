import type {DLGlobalData} from 'shared/types/common';

import {replaceRelativeLinksToAbsoluteInHTML} from '../docs';

const enUser = {
    user: {
        lang: 'en',
    },
};

const ruUser = {
    user: {
        lang: 'ru',
    },
};

const datalensDocsRu = 'https://datalens.docs.endpoint.ru';
const datalensDocsEn = 'https://datalens.docs.endpoint.en';

describe('replaceRelativeLinksToAbsoluteInHTML', () => {
    let windowSpy: jest.SpyInstance<{DL: DLGlobalData}>;
    beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get');
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    it("should return the same link if relative path doesn't exist", () => {
        windowSpy.mockImplementation(() => ({
            DL: {
                ...enUser,
                endpoints: {
                    datalensDocsEn,
                    datalensDocsRu,
                },
            } as unknown as DLGlobalData,
        }));
        const html = `<div>
            <a href="http://www.very.important.link/path">Click</a>
        </div>`;

        const result = replaceRelativeLinksToAbsoluteInHTML(html);

        expect(result).toEqual(html);
    });

    it('should replace relative path to absolute for all href attributes for en documentation', () => {
        windowSpy.mockImplementation(() => ({
            DL: {
                ...enUser,
                endpoints: {
                    datalensDocsEn,
                    datalensDocsRu,
                },
            } as unknown as DLGlobalData,
        }));
        const html = `<div>
            <a href="http://www.very.important.link/path">Click</a>
            <a href="../path">Click2</a>
            <a href="../path2">Click3</a>
        </div>`;

        const expectedResult = `<div>
            <a href="http://www.very.important.link/path">Click</a>
            <a href="${datalensDocsEn}/path">Click2</a>
            <a href="${datalensDocsEn}/path2">Click3</a>
        </div>`;

        const result = replaceRelativeLinksToAbsoluteInHTML(html);

        expect(result).toEqual(expectedResult);
    });

    it('should replace relative path to absolute for all href attributes for ru documentation', () => {
        windowSpy.mockImplementation(() => ({
            DL: {
                ...ruUser,
                endpoints: {
                    datalensDocsEn,
                    datalensDocsRu,
                },
            } as unknown as DLGlobalData,
        }));
        const html = `<div>
            <a href="http://www.very.important.link/path">Click</a>
            <a href="../path">Click2</a>
            <a href="../path2">Click3</a>
        </div>`;

        const expectedResult = `<div>
            <a href="http://www.very.important.link/path">Click</a>
            <a href="${datalensDocsRu}/path">Click2</a>
            <a href="${datalensDocsRu}/path2">Click3</a>
        </div>`;

        const result = replaceRelativeLinksToAbsoluteInHTML(html);

        expect(result).toEqual(expectedResult);
    });

    it('should replace relative path to absolute one regardless of nesting', () => {
        windowSpy.mockImplementation(() => ({
            DL: {
                ...enUser,
                endpoints: {
                    datalensDocsEn,
                    datalensDocsRu,
                },
            } as unknown as DLGlobalData,
        }));
        const html = `<div>
            <a href="http://www.very.important.link/path">Click</a>
            <a href="../../../../path/abc/wow">Click2</a>
            <a href="../path2/super_2_important_link/123/qwe">Click3</a>
            <a href="/path3/qwe/123/q_1_2">Click3</a>
            <a href="path3/qwe/123/q_1_2">Click3</a>
        </div>`;

        const expectedResult = `<div>
            <a href="http://www.very.important.link/path">Click</a>
            <a href="${datalensDocsEn}/path/abc/wow">Click2</a>
            <a href="${datalensDocsEn}/path2/super_2_important_link/123/qwe">Click3</a>
            <a href="${datalensDocsEn}/path3/qwe/123/q_1_2">Click3</a>
            <a href="${datalensDocsEn}/path3/qwe/123/q_1_2">Click3</a>
        </div>`;

        const result = replaceRelativeLinksToAbsoluteInHTML(html);

        expect(result).toEqual(expectedResult);
    });
});
