import type {FC} from 'react';
import React from 'react';

import type {DatepickerProps} from './Datepicker';
import {Datepicker, datepickerDefaultProps} from './Datepicker';

export * from './Datepicker';

export const DatePickerWrapper: FC<DatepickerProps> = (props) => <Datepicker {...props} />;
DatePickerWrapper.defaultProps = datepickerDefaultProps;
