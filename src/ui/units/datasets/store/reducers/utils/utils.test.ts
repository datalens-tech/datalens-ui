import type {DatasetSource} from 'shared';

import type {FreeformSource} from '../../types';

import {RELATIONS} from './mocks';

import {getAvatarsAndRelationsToDelete, getFilteredSources} from './';

describe('Datasets store/reducers utils', () => {
    const FAKE_SRC_TABLE = {
        id: '1bf3b2d1-d9a1-11eb-b4c1-6bf0db5a703e',
        source_type: 'PG_TABLE',
    } as DatasetSource;
    const FAKE_SRC_SUBSELECT = {
        id: '3c8f5840-3591-11ec-a5e7-5debc1850e5f',
        source_type: 'PG_SUBSELECT',
    } as DatasetSource;
    const fakeSources = [FAKE_SRC_TABLE, FAKE_SRC_SUBSELECT] as DatasetSource[];
    const fakeFreeformSources = [{source_type: 'PG_SUBSELECT'}] as FreeformSource[];

    describe('getFilteredSources', () => {
        test('returns an array with FAKE_SRC_SUBSELECT', () => {
            const result = getFilteredSources(fakeSources, fakeFreeformSources);
            expect(result).toEqual([FAKE_SRC_SUBSELECT]);
        });
    });

    describe('getAvatarsAndRelationsToDelete', () => {
        test('returns the correct ids of removing avatars and links', () => {
            const expectedResult = {
                avatarsToDelete: [
                    '80084fa0-9004-11ec-b710-d91e8a67622d',
                    '824c4c30-9004-11ec-b710-d91e8a67622d',
                    '854986a0-9004-11ec-b710-d91e8a67622d',
                    'c3581a50-9005-11ec-b710-d91e8a67622d',
                    'c574dfd0-9005-11ec-b710-d91e8a67622d',
                    '877e6800-9004-11ec-b710-d91e8a67622d',
                ],
                relationsToDelete: [
                    '80084fa1-9004-11ec-b710-d91e8a67622d',
                    '824c4c31-9004-11ec-b710-d91e8a67622d',
                    '854986a1-9004-11ec-b710-d91e8a67622d',
                    'c3581a51-9005-11ec-b710-d91e8a67622d',
                    'c574dfd1-9005-11ec-b710-d91e8a67622d',
                    '877e6801-9004-11ec-b710-d91e8a67622d',
                ],
            };
            const result = getAvatarsAndRelationsToDelete(
                '80084fa0-9004-11ec-b710-d91e8a67622d',
                RELATIONS,
            );
            expect(result).toEqual(expectedResult);
        });
    });
});
