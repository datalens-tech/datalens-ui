import type {ServerField} from '../../../../../../../../../../shared';

export const FIELDS = [
    {
        type: 'DIMENSION',
        guid: 'ac8dd226-3372-4212-bde7-17afc792a728',
        title: 'Category',
        datasetId: '4fnqsvsxtmcix',
    },
    {
        type: 'MEASURE',
        guid: '4b6463d1-30e1-425e-b7d2-77205bc75de6',
        title: 'Profit',
        datasetId: '4fnqsvsxtmcix',
    },
] as ServerField[];
export const FIELDS_FOR_ORDER_TEST = [
    {
        type: 'MEASURE',
        guid: '4b6463d1-30e1-425e-b7d2-77205bc75de6',
        title: 'Profit',
        datasetId: '4fnqsvsxtmcix',
    },
    {
        type: 'DIMENSION',
        guid: 'ac8dd226-3372-4212-bde7-17afc792a728',
        title: 'Category',
        datasetId: '4fnqsvsxtmcix',
    },
    {
        type: 'MEASURE',
        guid: '809d03e1-15b7-4bdc-b108-653603a27001',
        title: 'Sales',
        datasetId: '4fnqsvsxtmcix',
    },
] as ServerField[];
export const FIELDS_WITH_DIFFERENT_DATASET_ID_TEST = [
    {
        type: 'DIMENSION',
        guid: 'ac8dd226-3372-4212-bde7-17afc792a728',
        title: 'Category',
        datasetId: '4fnqsvsxtmcix',
    },
    {
        type: 'MEASURE',
        guid: '4b6463d1-30e1-425e-b7d2-77205bc75de6',
        title: 'Profit',
        datasetId: '4fnqsvsxtmcix',
    },
    {
        type: 'MEASURE',
        guid: '809d03e1-15b7-4bdc-b108-653603a27001',
        title: 'Sales',
        datasetId: '4fnqsvsxtmcix',
    },
    {
        type: 'MEASURE',
        guid: '21eaad10-0cc2-11ed-9fc7-c54699cfb56e',
        title: 'Height (1)',
        datasetId: 'wz12arsqpvuup',
    },
] as ServerField[];

export const COLUMNS = [
    'ac8dd226-3372-4212-bde7-17afc792a728',
    '4b6463d1-30e1-425e-b7d2-77205bc75de6',
];
export const COLUMNS_FOR_ORDER_TEST = [
    '4b6463d1-30e1-425e-b7d2-77205bc75de6',
    'ac8dd226-3372-4212-bde7-17afc792a728',
    '809d03e1-15b7-4bdc-b108-653603a27001',
];
export const COLUMNS_FOR_DATASET_ID_1 = [
    'ac8dd226-3372-4212-bde7-17afc792a728',
    '4b6463d1-30e1-425e-b7d2-77205bc75de6',
    '809d03e1-15b7-4bdc-b108-653603a27001',
];
export const COLUMNS_FOR_DATASET_ID_2 = [
    '21eaad10-0cc2-11ed-9fc7-c54699cfb56e',
    'c5eb54f9-1fe6-436d-8d47-7529de3857af',
];

export const DATASET_ID_1 = '4fnqsvsxtmcix';
export const DATASET_ID_2 = 'wz12arsqpvuup';
