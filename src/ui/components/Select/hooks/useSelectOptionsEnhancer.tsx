import React from 'react';

import {SelectOption} from '@gravity-ui/uikit';

export const useSelectOptionsEnhancer = <Option,>(options: SelectOption<Option>[]) => {
    const filteredOptions = React.useMemo(
        () => options?.filter((opt) => opt && opt.value),
        [options],
    );
    return filteredOptions;
};
