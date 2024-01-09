import React from 'react';

import {Datepicker, type DatepickerProps} from '../Datepicker';

export type DatepickerControlProps = DatepickerProps & {controlId: string};

export const DatepickerControl = ({controlId: _id, ...otherProps}: DatepickerControlProps) => {
    return <Datepicker {...otherProps} />;
};
