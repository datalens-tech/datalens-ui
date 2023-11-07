import {QLEntryDataShared} from '../../../../types';
import {mapUndefinedConfigToV1} from '../v1/mapUndefinedConfigToV1';

describe('mapUndefinedConfigToV1', () => {
    it('should set "nulls" setting for y and y2 placeholder to connect, if it is ignore', () => {
        const config = {
            visualization: {
                placeholders: [{settings: {nulls: 'ignore'}}, {settings: {nulls: 'ignore'}}],
            },
            version: undefined,
        } as unknown as QLEntryDataShared;

        const result = mapUndefinedConfigToV1(config);

        expect(result).toEqual({
            visualization: {
                placeholders: [{settings: {nulls: 'connect'}}, {settings: {nulls: 'connect'}}],
                version: '1',
            },
        });
    });

    it('should leave "nulls" setting for y and y2 placeholder as it is, if it is not ignore', () => {
        const config = {
            visualization: {
                placeholders: [
                    {settings: {nulls: 'ignore'}},
                    {settings: {nulls: 'as-0'}},
                    {settings: {nulls: 'connect'}},
                ],
            },
            version: undefined,
        } as unknown as QLEntryDataShared;

        const result = mapUndefinedConfigToV1(config);

        expect(result).toEqual({
            visualization: {
                placeholders: [
                    {settings: {nulls: 'connect'}},
                    {settings: {nulls: 'as-0'}},
                    {settings: {nulls: 'connect'}},
                ],
            },
            version: '1',
        });
    });
});
