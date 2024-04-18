import React from 'react';

import {CirclesIntersection} from '@gravity-ui/icons';
import {Button, Icon, Popover, TextArea} from '@gravity-ui/uikit';

type Props = {
    hint: string | undefined;
    fieldDescription?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

export const FieldHintSetting = (props: Props) => {
    const {hint, fieldDescription, onChange, disabled} = props;

    const handleDatasetIcon = () => {
        onChange(fieldDescription || '');
    };

    return (
        <div style={{display: 'flex', gap: '8px'}}>
            <TextArea value={hint} onUpdate={onChange} hasClear={true} disabled={disabled} />
            {fieldDescription && (
                <Popover content={'Use field description from dataset'} disabled={disabled}>
                    <Button onClick={handleDatasetIcon} disabled={disabled}>
                        <Icon data={CirclesIntersection} size={14} />
                    </Button>
                </Popover>
            )}
        </div>
    );
};
