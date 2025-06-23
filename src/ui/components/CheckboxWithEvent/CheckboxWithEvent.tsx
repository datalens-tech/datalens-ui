import React, {useRef} from 'react';

import {Checkbox, type CheckboxProps} from '@gravity-ui/uikit';

export type CheckboxWithEventProps = Omit<CheckboxProps, 'onUpdate'> & {
    onUpdateWithEvent: (checked: boolean, event: React.MouseEvent | null) => void;
};

export const CheckboxWithEvent: React.FC<CheckboxWithEventProps> = ({
    onUpdateWithEvent,
    ...props
}) => {
    const eventRef = useRef<React.MouseEvent | null>(null);

    const handleCheckboxClick = (event: React.MouseEvent) => {
        eventRef.current = event;
    };

    const handleCheckboxChange = (isSelected: boolean) => {
        onUpdateWithEvent(isSelected, eventRef.current);

        eventRef.current = null;
    };

    return (
        <Checkbox
            {...props}
            controlProps={{onClick: handleCheckboxClick}}
            onUpdate={handleCheckboxChange}
        />
    );
};
