import React, {FC} from 'react';

import {YCSelect, YCSelectDefaultProps, YCSelectProps} from './YCSelect';

export * from './YCSelect';

export const YCSelectWrapper: FC<YCSelectProps<any>> = (props) => <YCSelect {...props} />;
YCSelectWrapper.defaultProps = YCSelectDefaultProps;
