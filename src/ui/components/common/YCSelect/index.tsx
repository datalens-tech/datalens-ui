import type {FC} from 'react';
import React from 'react';

import type {YCSelectProps} from './YCSelect';
import {YCSelect, YCSelectDefaultProps} from './YCSelect';

export * from './YCSelect';

export const YCSelectWrapper: FC<YCSelectProps<any>> = (props) => <YCSelect {...props} />;
YCSelectWrapper.defaultProps = YCSelectDefaultProps;
