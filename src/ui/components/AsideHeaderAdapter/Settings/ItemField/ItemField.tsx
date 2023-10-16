import React, {Fragment} from 'react';

import {ControlGroupOption, RadioButton, Select} from '@gravity-ui/uikit';

type ItemFieldProps = {
    isMobile: boolean;
    value: string;
    onUpdate: (value: string) => void;
    options: ControlGroupOption[];
};

export const ItemField = ({isMobile, value, onUpdate, options}: ItemFieldProps) => {
    const handleSelectOption = (option: string[]) => {
        onUpdate(option[0]);
    };

    return (
        <Fragment>
            {isMobile ? (
                <Select
                    width="max"
                    size="xl"
                    value={[value]}
                    onUpdate={handleSelectOption}
                    options={options}
                />
            ) : (
                <RadioButton options={options} value={value} onUpdate={onUpdate} />
            )}
        </Fragment>
    );
};
