import React from 'react';

import isEqual from 'lodash/isEqual';

export function useSyncedValue<T>(
    propValue: T,
    areEqual: (v1: T, v2: T) => boolean = isEqual,
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = React.useState<T>(propValue);

    React.useEffect(() => {
        setValue((prevValue) => {
            return areEqual(prevValue, propValue) ? prevValue : propValue;
        });
    }, [areEqual, propValue]);

    return [value, setValue];
}
