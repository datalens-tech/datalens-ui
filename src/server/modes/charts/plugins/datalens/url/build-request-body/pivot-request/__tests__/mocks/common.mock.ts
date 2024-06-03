import type {ServerField} from '../../../../../../../../../../shared';

export const ORDER_BY_MAP = {
    '9aa48a4f-cace-4256-bd59-55fc7aa43c4f': 'desc',
    '56185375-6b39-4ca2-aec2-f0971b7332bc': 'asc',
    '9781c180-fe55-11ea-be64-078ac452d479': 'desc',
    '1899d37a-ff15-4bbc-b9f1-9df1e5f715ee': 'desc',
};

export const MOCKED_DIMENSION_FIELD = {
    guid: 'f7a2f8b0-d556-11ed-99ad-75d0706437d7',
    type: 'DIMENSION',
} as ServerField;
export const MOCKED_MEASURE_FIELD = {
    guid: '7d67c220-f490-11e8-8706-c9ca730e1cff',
    type: 'MEASURE',
} as ServerField;
export const MOCKED_MEASURE_NAMES_FIELD = {
    title: 'Measure Names',
    type: 'PSEUDO',
};
