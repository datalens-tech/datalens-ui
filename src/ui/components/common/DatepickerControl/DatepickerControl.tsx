import React from 'react';

import {Datepicker, type DatepickerProps} from '../Datepicker';

export type DatepickerControlProps = DatepickerProps & {widgetId: string};

export const DatepickerControl = ({widgetId: _id, ...otherProps}: DatepickerControlProps) => {
    return <Datepicker {...otherProps} />;
};
