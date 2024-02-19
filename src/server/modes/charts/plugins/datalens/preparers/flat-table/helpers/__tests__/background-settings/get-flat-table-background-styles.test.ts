import {getFlatTableBackgroundStyles} from '../../background-settings';
import type {GetFlatTableCellBackgroundSettingsStylesArgs} from '../../background-settings/types';

describe('getFlatTableBackgroundStyles', () => {
    it('The background color should be applied for null values', () => {
        const field = {guid: '_guid', title: 'abc', data_type: 'integer', datasetId: '_datasetId'};
        const args = {
            column: {
                ...field,
                backgroundSettings: {
                    settings: {
                        paletteState: {
                            palette: '_palette',
                            mountedColors: {
                                Null: 1,
                            },
                        },
                    },
                    colorFieldGuid: field.guid,
                },
            },
            values: [null],
            idToTitle: {[field.guid]: field.title},
            order: [[{...field}]],
            idToDataType: {[field.guid]: field.data_type},
            loadedColorPalettes: {_palette: {colors: ['color1', 'color2']}},
        } as unknown as GetFlatTableCellBackgroundSettingsStylesArgs;

        expect(getFlatTableBackgroundStyles(args)).toEqual({
            backgroundColor: 'color2',
            color: '#FFF',
        });
    });
});
