import React, {FC} from 'react';

import {Datepicker, DatepickerProps, datepickerDefaultProps} from './Datepicker';

export * from './Datepicker';

export const DatePickerWrapper: FC<DatepickerProps> = (props) => <Datepicker {...props} />;
DatePickerWrapper.defaultProps = datepickerDefaultProps;
