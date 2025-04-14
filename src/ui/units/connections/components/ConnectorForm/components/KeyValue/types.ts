import type {KeyValueItem} from 'shared/schema/types';

export type KeyValueProps = Omit<KeyValueItem, 'id'>;

export type KeyValueEntry = {
    key: string;
    value: string | null;
    error?: 'duplicated-key';
    initial?: boolean;
};
