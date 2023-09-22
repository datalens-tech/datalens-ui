import {Update} from '../../../../../../shared';
import {UpdateDatasetArgs, getDatasetUpdates} from '../getDatasetUpdates';

const DATASET_ID = 'ds_id';

const args = {
    dataset: {
        id: DATASET_ID,
        dataset: {
            result_schema: [],
        },
        realName: 'TestDataset',
    },
    datasetSchema: [],
    currentDatasets: [
        {
            id: DATASET_ID,
        },
    ],
    visualization: {
        hierarchies: [],
    },
    updates: [],
} as unknown as UpdateDatasetArgs;

describe('getDatasetUpdates', () => {
    it('update with "delete_field" action -> updates without deleted field', () => {
        const fieldGuid = 'guid';
        const result = getDatasetUpdates({
            ...args,
            currentUpdates: [
                {
                    action: 'add_field',
                    field: {
                        guid: fieldGuid,
                        datasetId: DATASET_ID,
                    },
                },
            ],
            updates: [
                {
                    action: 'delete_field',
                    field: {
                        guid: fieldGuid,
                    },
                },
            ],
        });
        const expected: Update[] = [];
        expect(result.updates).toEqual(expected);
    });
});
