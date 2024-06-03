import type {QLEntryDataShared} from '../../../../types';
import {mapUndefinedConfigToV1} from '../v1/mapUndefinedConfigToV1';

describe('mapUndefinedConfigToV1', () => {
    it('should set "nulls" setting for y placeholder to connect, if it is ignore', () => {
        const config = {
            visualization: {
                placeholders: [
                    {id: 'y', settings: {nulls: 'ignore'}},
                    {id: 'y', settings: {nulls: 'ignore'}},
                ],
            },
            version: undefined,
        } as unknown as QLEntryDataShared;

        const result = mapUndefinedConfigToV1(config);

        expect(result).toMatchObject({
            version: '1',
            visualization: {
                placeholders: [
                    {id: 'y', settings: {nulls: 'connect'}},
                    {id: 'y', settings: {nulls: 'connect'}},
                ],
            },
        });
    });

    it('should leave "nulls" setting for y  placeholder as it is, if it is not ignore', () => {
        const config = {
            visualization: {
                placeholders: [
                    {id: 'y', settings: {nulls: 'ignore'}},
                    {id: 'y', settings: {nulls: 'as-0'}},
                    {id: 'y', settings: {nulls: 'connect'}},
                ],
            },
            version: undefined,
        } as unknown as QLEntryDataShared;

        const result = mapUndefinedConfigToV1(config);

        expect(result).toMatchObject({
            version: '1',
            visualization: {
                placeholders: [
                    {id: 'y', settings: {nulls: 'connect'}},
                    {id: 'y', settings: {nulls: 'as-0'}},
                    {id: 'y', settings: {nulls: 'connect'}},
                ],
            },
        });
    });

    it.each([{version: undefined, visualization: {id: 'line'}}, {version: undefined}])(
        'should return same config if placeholders does not exists',
        (config) => {
            const result = mapUndefinedConfigToV1(config as QLEntryDataShared);

            expect(result).toMatchObject({...config, version: '1'});
        },
    );
});
