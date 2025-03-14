import type {RowEntryData} from 'ui/components/EntryRow/EntryRow';

// TODO: remove when api will be added
export const notifications: {
    code?: string;
    message: string;
    level: 'info' | 'warning' | 'critical';
    entries: RowEntryData[];
}[] = [
    {
        code: 'test1',
        message:
            'Long long long long long long long long long long long long long long long long long long long long long long Info Alert',
        level: 'info',
        entries: [
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'clickhouse',
                key: 'Connections/Sample CH 1',
            },
            {
                entryId: '11221l31112',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgres 1',
            },
        ],
    },
    {
        code: 'test2',
        message: 'Short Warning alert',
        level: 'warning',
        entries: [
            {
                entryId: '11221l31113',
                scope: 'connection',
                type: 'clickhouse',
                key: 'Connections/Sample CH 2',
            },
            {
                entryId: '11221l31114',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgres 2',
            },
        ],
    },
    {
        code: 'test3',
        message: 'Some critical alert',
        level: 'critical',
        entries: [
            {
                entryId: '11221l31115',
                scope: 'connection',
                type: 'clickhouse',
                key: 'Connections/Sample CH 3',
            },
            {
                entryId: '11221l31116',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgres 3',
            },
            {
                entryId: '11221l31117',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgres 4',
            },
        ],
    },
];
