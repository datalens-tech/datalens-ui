import React from 'react';

import {isEqual} from 'lodash';

export function useChangedValue<T>(value: T, comparator: (a: T, b: T) => boolean = isEqual) {
    const prevValueRef = React.useRef<T>(value);

    const isChanged = !comparator(prevValueRef.current, value);

    if (isChanged) {
        prevValueRef.current = value;
    }

    return isChanged;
}
