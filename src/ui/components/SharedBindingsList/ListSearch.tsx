import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {usePrevious} from 'ui';

export type ListSearchProps = {
    disabled?: boolean;
    searchDelay?: number;
    value: string;
    onUpdate: (value: string) => void;
    loading?: boolean;
    placeholder?: string;
    className?: string;
};

export const ListSearch: React.FC<ListSearchProps> = ({
    disabled,
    value,
    onUpdate,
    className,
    loading,
    placeholder,
}) => {
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const prevLoading = usePrevious(loading);

    React.useEffect(() => {
        if (!loading && prevLoading !== undefined && loading !== prevLoading) {
            searchInputRef.current?.focus?.();
        }
    }, [loading, prevLoading]);

    return (
        <TextInput
            className={className}
            value={value}
            hasClear={true}
            onUpdate={onUpdate}
            placeholder={placeholder}
            disabled={loading || disabled}
            controlRef={searchInputRef}
        />
    );
};
