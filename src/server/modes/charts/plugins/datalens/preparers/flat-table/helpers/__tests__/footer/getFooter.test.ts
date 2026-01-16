import {PALETTE_ID} from '../../../../../../../../../../shared';
import {getFooter} from '../../footer';
import * as footerHelpersModule from '../../footer';
import {
    COLUMNS,
    COLUMNS_WITH_DUPLICATES,
    ID_TO_DATA_TYPE,
    ID_TO_TITLE,
    ORDER,
    TOTALS,
} from '../mocks/getFooter.mock';

const i18nMock = {
    I18n: {
        keyset: (_str: string) => {
            return function (key: string, params: Record<string, string | number>) {
                if (key === 'label_total-value') {
                    return `Total: ${params.value}`;
                }

                return `Total`;
            };
        },
    },
    I18N: {
        getLang: () => {
            return 'en';
        },
        setLang: jest.fn(),
    },
};

jest.mock('../../../../../../../../../../i18n', () => i18nMock);

describe('getFooter', () => {
    const ChartEditorMock = {
        getLang: () => 'en',
        getTranslation: (keyset: string, key: string, params: Record<string, string | number>) => {
            return i18nMock.I18n.keyset(keyset)(key, params);
        },
    };
    const colorsConfig = {
        loadedColorPalettes: {},
        colors: [],
        gradientColors: [],
        availablePalettes: {},
    };

    it('Returns the footer: in the first place is always "Total"', () => {
        const footer = getFooter({
            columns: COLUMNS,
            idToDataType: ID_TO_DATA_TYPE,
            idToTitle: ID_TO_TITLE,
            totals: TOTALS,
            order: ORDER,
            columnValuesByColumn: {},
            ChartEditor: ChartEditorMock,
            colorsConfig,
            defaultColorPaletteId: PALETTE_ID.CLASSIC_20,
        });

        expect(footer[0].cells).toHaveLength(2);

        expect(footer[0].cells[0].value).toEqual('Total');
        expect(footer[0].cells[1].value).toEqual(282070);
    });

    it('All footer cells have the same style', () => {
        const expectedStyles = {
            'background-color': 'var(--g-color-base-generic)',
            'font-weight': 500,
        };

        const footer = getFooter({
            columns: COLUMNS,
            idToDataType: ID_TO_DATA_TYPE,
            idToTitle: ID_TO_TITLE,
            totals: TOTALS,
            order: ORDER,
            columnValuesByColumn: {},
            ChartEditor: ChartEditorMock,
            colorsConfig,
            defaultColorPaletteId: PALETTE_ID.CLASSIC_20,
        });

        footer[0].cells.forEach((cell) => {
            expect(cell.css).toEqual(expectedStyles);
        });
    });

    it('If there is an measure in the first column, then the function returns "Total" with the measure value', () => {
        const footer = getFooter({
            columns: [...COLUMNS].reverse(),
            idToDataType: ID_TO_DATA_TYPE,
            idToTitle: ID_TO_TITLE,
            totals: [...TOTALS].reverse(),
            order: [...ORDER].reverse(),
            columnValuesByColumn: {},
            ChartEditor: ChartEditorMock,
            colorsConfig,
            defaultColorPaletteId: PALETTE_ID.CLASSIC_20,
        });

        expect(footer[0].cells).toHaveLength(2);

        expect(footer[0].cells[0].value).toEqual('Total: 282070');
        expect(footer[0].cells[1].value).toEqual('');
    });

    it('The total is set correctly, even if the field is duplicated in columns', () => {
        const footer = getFooter({
            columns: COLUMNS_WITH_DUPLICATES,
            idToTitle: ID_TO_TITLE,
            idToDataType: ID_TO_DATA_TYPE,
            totals: TOTALS,
            order: ORDER,
            columnValuesByColumn: {},
            ChartEditor: ChartEditorMock,
            colorsConfig,
            defaultColorPaletteId: PALETTE_ID.CLASSIC_20,
        });

        expect(footer[0].cells).toHaveLength(4);

        expect(footer[0].cells[0].value).toEqual('Total');
        expect(footer[0].cells[1].value).toEqual(282070);
        expect(footer[0].cells[2].value).toEqual(282070);
        expect(footer[0].cells[3].value).toEqual('');
    });

    it('The title setting function is called 1 time during the entire getFooter operation', () => {
        const getTotalTitleFake = jest.spyOn(footerHelpersModule, 'getTotalTitle');
        const footer = getFooter({
            columns: COLUMNS_WITH_DUPLICATES,
            idToDataType: ID_TO_DATA_TYPE,
            idToTitle: ID_TO_TITLE,
            totals: TOTALS,
            order: ORDER,
            columnValuesByColumn: {},
            ChartEditor: ChartEditorMock,
            colorsConfig,
            defaultColorPaletteId: PALETTE_ID.CLASSIC_20,
        });

        expect(footer[0].cells).toHaveLength(4);
        expect(getTotalTitleFake).toBeCalledTimes(1);
    });
});
