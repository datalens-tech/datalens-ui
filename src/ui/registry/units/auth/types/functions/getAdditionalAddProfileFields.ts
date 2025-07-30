import type React from 'react';

type Props = {
    value?: any;
    onChange: (v: any) => void;
};

export type GetAdditionalAddProfileFields = () => {
    fields: {key: string; label: string; Component: React.FC<Props>}[];
    onApply: (
        userId: string,
        values: Record<string, any>,
        onError: (message: string) => void,
    ) => Promise<void>;
};
