import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';

export const useSelectOptionsEnhancer = <Option,>(options: SelectOption<Option>[]) => {
    const filteredOptions = React.useMemo(
        () => options?.filter((opt) => opt !== null && opt?.value !== null),
        [options],
    );
    return filteredOptions;
};
