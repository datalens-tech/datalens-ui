import type {RowEntryData} from 'ui/components/EntryRow/EntryRow';

// TODO: remove when api will be added
export const notifications: {
    code?: string;
    message: string;
    level: 'info' | 'warning' | 'critical';
    entries: RowEntryData[];
}[] = [
    {
        code: 'test',
        message:
            'Long long long long long long long long long long long long long long long long long long long long long long Info Alert',
        level: 'info',
        entries: [
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'clickhouse',
                key: 'Connections/Sample CH',
            },
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgres',
            },
        ],
    },
    {
        code: 'test',
        message: 'Short Warning alert',
        level: 'warning',
        entries: [
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'clickhouse',
                key: 'Connections/Sample CH2',
            },
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgreso',
            },
        ],
    },
    {
        code: 'test',
        message: 'Some critical alert oh no',
        level: 'critical',
        entries: [
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'clickhouse',
                key: 'Connections/Sample CH4',
            },
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgreso2',
            },
            {
                entryId: '11221l31111',
                scope: 'connection',
                type: 'postgres',
                key: 'Connections/Sample Postgreso4',
            },
        ],
    },
];
