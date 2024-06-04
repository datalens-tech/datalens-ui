import type {DataLensApiError} from '../../../../../../typings';

type DataWithError<T> = T & {error?: DataLensApiError};

type SyncApply = {
    applyMode: 'sync';
    onApply: (value: string) => void;
};

type AsyncApply<T> = {
    applyMode: 'async';
    onApply: (value: string) => Promise<DataWithError<T>>;
    onError?: (error: DataLensApiError) => void;
    onSuccess?: (data: T) => void;
};

export type DialogConnWithInputProps<T = DataWithError<unknown>> = {
    caption: string;
    value?: string;
    textButtonApply?: string;
    textButtonCancel?: string;
    onClose: () => void;
} & (SyncApply | AsyncApply<T>);
