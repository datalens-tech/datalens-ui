import type React from 'react';

import type {IconProps} from '@gravity-ui/uikit';

export type GetAdditionalChartkitErrorContent = (args: {code: string}) => {
    iconData?: IconProps['data'];
    detailedTitle?: React.ReactNode;
};
